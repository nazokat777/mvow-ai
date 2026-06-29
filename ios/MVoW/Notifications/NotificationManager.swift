import Foundation
import UserNotifications

/// Bildirishnoma + budilnik markazi — taymer tugashi va kunlik vazifalar uchun
/// mahalliy bildirishnoma (local notification) rejalashtiradi.
///
/// MUHIM: hech qanday maxsus entitlement yoki PULLIK Apple hisobi KERAK EMAS —
/// `.default` ovoz + `.timeSensitive` daraja bepul ishlaydi. (Faqat "Critical
/// Alerts" — sukut/DND'ni yorib o'tuvchi ovoz — Apple ruxsatini talab qiladi;
/// u hozircha O'CHIQ.)
final class NotificationManager: NSObject, ObservableObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationManager()
    private let center = UNUserNotificationCenter.current()

    /// Bildirishnomadagi tugma bosilganda UI shu qiymatni kuzatib yo'naltiradi.
    @Published var lastAction: String?
    /// Foydalanuvchi ruxsat berganmi.
    @Published var authorized = false

    private override init() { super.init() }

    /// Ilova ochilganda BIR MARTA chaqiriladi (MVoWApp.onAppear).
    func configure() {
        center.delegate = self
        registerCategories()
        center.requestAuthorization(options: [.alert, .sound, .badge]) { [weak self] granted, _ in
            DispatchQueue.main.async { self?.authorized = granted }
        }
    }

    private func registerCategories() {
        let cont = UNNotificationAction(identifier: "CONTINUE", title: "Davom et", options: [.foreground])
        let pause = UNNotificationAction(identifier: "PAUSE", title: "Pauza", options: [])
        let cat = UNNotificationCategory(identifier: "TIMER_DONE", actions: [cont, pause],
                                         intentIdentifiers: [], options: [])
        center.setNotificationCategories([cat])
    }

    private func makeContent(title: String, body: String) -> UNMutableNotificationContent {
        let c = UNMutableNotificationContent()
        c.title = title
        c.body = body
        c.sound = .default
        c.categoryIdentifier = "TIMER_DONE"
        c.interruptionLevel = .timeSensitive   // Focus rejimlarini yoradi (iOS 15+), entitlement shart emas
        return c
    }

    // MARK: - Rejalashtirish

    /// Taymer/Pomodoro tugashida budilnik (nisbiy vaqt).
    func scheduleTimerEnd(id: String, after seconds: TimeInterval, title: String, body: String) {
        guard seconds > 0 else { return }
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: seconds, repeats: false)
        let req = UNNotificationRequest(identifier: id, content: makeContent(title: title, body: body), trigger: trigger)
        center.add(req)
    }

    /// Kunlik vazifa eslatmasi (devor-soati bo'yicha, har kuni takrorlanadi).
    func scheduleDailyTask(id: String, title: String, body: String, hour: Int, minute: Int, repeats: Bool = true) {
        var dc = DateComponents(); dc.hour = hour; dc.minute = minute
        let trigger = UNCalendarNotificationTrigger(dateMatching: dc, repeats: repeats)
        let req = UNNotificationRequest(identifier: id, content: makeContent(title: title, body: body), trigger: trigger)
        center.add(req)
    }

    func cancel(ids: [String]) { center.removePendingNotificationRequests(withIdentifiers: ids) }
    func cancelAll() { center.removeAllPendingNotificationRequests() }

    // MARK: - UNUserNotificationCenterDelegate

    /// Ilova OCHIQ turganda ham banner + ovoz chiqsin (iOS standart holatda buni bosadi).
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .list])
    }

    /// Tugma bosilganda yo'nalishni saqlaymiz (UI kuzatadi).
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        DispatchQueue.main.async { self.lastAction = response.actionIdentifier }
        completionHandler()
    }
}
