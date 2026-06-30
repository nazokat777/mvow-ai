import Foundation

/// Bitta kunlik eslatma: nom + vaqt (soat/daqiqa) + yoqilgan/o'chirilgan.
struct PlanTask: Identifiable, Codable, Equatable {
    var id = UUID()
    var title: String
    var hour: Int
    var minute: Int
    var enabled: Bool = true
    var timeLabel: String { String(format: "%02d:%02d", hour, minute) }
}

/// Kunlik reja/eslatmalar markazi — yagona manba.
/// UserDefaults'ga saqlanadi (iOS 16 mos), o'zgarganda bildirishnomalar AVTOMATIK
/// qayta rejalashtiriladi (NotificationManager.scheduleDailyTask).
final class PlanStore: ObservableObject {
    static let shared = PlanStore()
    private let key = "mvow.ios.plan"

    @Published var tasks: [PlanTask] = [] {
        didSet { save(); reschedule() }
    }

    private init() {
        // Boshlang'ich yuklash — didSet ISHGA TUSHMAYDI (reschedule MVoWApp.onAppear'да,
        // NotificationManager.configure()/ruxsat so'ralganidan keyin bir marta chaqiriladi).
        if let data = UserDefaults.standard.data(forKey: key),
           let arr = try? JSONDecoder().decode([PlanTask].self, from: data) {
            _tasks = Published(initialValue: arr)
        }
    }

    private func save() {
        if let data = try? JSONEncoder().encode(tasks) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }

    func add(title: String, hour: Int, minute: Int) {
        var arr = tasks
        arr.append(PlanTask(title: title, hour: hour, minute: minute))
        arr.sort { ($0.hour * 60 + $0.minute) < ($1.hour * 60 + $1.minute) }
        tasks = arr
    }

    func remove(_ task: PlanTask) {
        tasks.removeAll { $0.id == task.id }
    }

    func toggle(_ task: PlanTask) {
        guard let i = tasks.firstIndex(where: { $0.id == task.id }) else { return }
        tasks[i].enabled.toggle()
    }

    /// Hamma yoqilgan vazifa uchun kunlik bildirishnoma qayta o'rnatiladi.
    func reschedule() {
        NotificationManager.shared.cancelAll()
        for t in tasks where t.enabled {
            NotificationManager.shared.scheduleDailyTask(
                id: "task-\(t.id.uuidString)",
                title: t.title,
                body: "Vaqt keldi: \(t.title)",
                hour: t.hour,
                minute: t.minute,
                repeats: true
            )
        }
    }
}
