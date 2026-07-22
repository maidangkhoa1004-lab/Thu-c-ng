// Nhắc lịch tiêm chủng tự động bằng Web Notification API của trình duyệt.
// Hoạt động khi tab web đang mở (kể cả không phải tab đang focus), không cần
// server đẩy thông báo hay email — phù hợp mức đồ án, không cần hạ tầng ngoài.

export function getNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return await Notification.requestPermission();
}

function notifiedKey(vaccinationId) {
  return `notified-vac-${vaccinationId}`;
}

function alreadyNotifiedToday(vaccinationId) {
  const today = new Date().toISOString().slice(0, 10);
  return localStorage.getItem(notifiedKey(vaccinationId)) === today;
}

function markNotifiedToday(vaccinationId) {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(notifiedKey(vaccinationId), today);
}

function reminderBody(petName, v) {
  if (v.daysLeft < 0) {
    return `${petName}: ${v.vaccine_name} đã quá hạn ${Math.abs(v.daysLeft)} ngày!`;
  }
  if (v.daysLeft === 0) {
    return `${petName}: ${v.vaccine_name} đến hạn hôm nay!`;
  }
  return `${petName}: ${v.vaccine_name} còn ${v.daysLeft} ngày nữa đến hạn.`;
}

// Gửi 1 thông báo demo ngay lập tức, không phụ thuộc dữ liệu lịch tiêm —
// dùng để người dùng kiểm chứng ngay là quyền thông báo đã hoạt động thật,
// thay vì phải chờ đến đúng lịch tiêm sắp hạn mới biết có lỗi hay không.
export function sendTestNotification() {
  if (getNotificationPermission() !== "granted") return false;

  try {
    const notification = new Notification("🔔 Paws & Vitality", {
      body: "Thông báo hoạt động bình thường — bạn sẽ được nhắc khi có lịch tiêm sắp đến hạn.",
      icon: "/favicon.svg",
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch (err) {
    console.error("Lỗi gửi thông báo thử:", err);
    return false;
  }
}

// vaccinesWithDays: mảng vaccine đã có sẵn field daysLeft (tính từ due_date).
// petById: hàm tra tên thú cưng theo pet_id, để nội dung thông báo dễ hiểu.
export function notifyDueVaccines(vaccinesWithDays, petById) {
  if (getNotificationPermission() !== "granted") return;

  vaccinesWithDays
    .filter((v) => v.status !== "Completed" && v.daysLeft !== null && v.daysLeft <= 7)
    .forEach((v) => {
      if (alreadyNotifiedToday(v.id)) return;

      const pet = petById ? petById(v.pet_id) : null;
      const petName = pet ? pet.name : "Thú cưng";

      try {
        const notification = new Notification("🔔 Nhắc lịch tiêm chủng — Paws & Vitality", {
          body: reminderBody(petName, v),
          icon: "/favicon.svg",
          tag: notifiedKey(v.id),
        });
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        markNotifiedToday(v.id);
      } catch (err) {
        console.error("Lỗi gửi thông báo nhắc lịch:", err);
      }
    });
}
