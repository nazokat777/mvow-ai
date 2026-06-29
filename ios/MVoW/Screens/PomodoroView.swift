import SwiftUI

/// Pomodoro 25/5/15 cycle timer. Mirrors Android `PomodoroScreen.kt`.
struct PomodoroView: View {
    enum Mode {
        case focus, shortBreak, longBreak, complete
        var label: String { ["FOKUS", "DAM", "UZUN DAM", "BAJARILDI"][index] }
        var accent: Color {
            switch self {
            case .focus: return MentorColors.gold
            case .shortBreak: return MentorColors.emeraldBright
            case .longBreak: return Color(red: 0.486, green: 0.659, blue: 0.788)
            case .complete: return MentorColors.gold
            }
        }
        var durationSec: Int {
            switch self {
            case .focus: return 25 * 60
            case .shortBreak: return 5 * 60
            case .longBreak: return 15 * 60
            case .complete: return 0
            }
        }
        var index: Int {
            switch self {
            case .focus: return 0
            case .shortBreak: return 1
            case .longBreak: return 2
            case .complete: return 3
            }
        }
    }

    @State private var mode: Mode = .focus
    @State private var seconds: Int = 25 * 60
    @State private var cycle: Int = 1
    @State private var isRunning = true

    var onSessionDone: () -> Void = {}

    var body: some View {
        ZStack {
            backgroundFor(mode: mode).ignoresSafeArea()

            VStack(spacing: 18) {
                header
                cycleRow
                Spacer()
                CircularTimer(progress: progress, digits: digits, label: mode.label, accent: mode.accent)
                Spacer()
                mentorCard
                MentorPrimaryButton(buttonLabel) {
                    if mode == .focus {
                        isRunning.toggle()
                        if isRunning { scheduleAlarm() } else { NotificationManager.shared.cancel(ids: ["pomo"]) }
                    } else {
                        advanceMode()
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 32)
            .padding(.bottom, 24)
        }
        .onReceive(Timer.publish(every: 1, on: .main, in: .common).autoconnect()) { _ in
            guard isRunning, mode != .complete else { return }
            if seconds > 0 { seconds -= 1 }
            if seconds == 0 { advanceMode() }
        }
        .onAppear { scheduleAlarm() }
    }

    /// Joriy faza tugashida budilnik (mahalliy bildirishnoma) qo'yadi — ilova
    /// yopiq turganda ham ovoz beradi.
    private func scheduleAlarm() {
        NotificationManager.shared.cancel(ids: ["pomo"])
        guard mode != .complete, seconds > 0 else { return }
        let title = mode == .focus ? "Fokus tugadi ✅" : "Dam tugadi"
        let body = mode == .focus ? "Ajoyib ish! Endi qisqa dam oling." : "Tayyormisiz? Keyingi siklni boshlaymiz."
        NotificationManager.shared.scheduleTimerEnd(id: "pomo", after: Double(seconds), title: title, body: body)
    }

    private var progress: Double {
        guard mode.durationSec > 0 else { return 1 }
        return 1.0 - Double(seconds) / Double(mode.durationSec)
    }
    private var digits: String {
        let m = seconds / 60, s = seconds % 60
        return String(format: "%02d:%02d", m, s)
    }
    private var buttonLabel: String {
        switch mode {
        case .focus: return isRunning ? "Pauza" : "Davom"
        case .shortBreak: return "Keyingi sikl"
        case .longBreak: return "Yangi sessiya"
        case .complete: return "Yakunlandi"
        }
    }

    private func backgroundFor(mode: Mode) -> Color {
        switch mode {
        case .shortBreak, .longBreak: return Color(red: 0.039, green: 0.102, blue: 0.078)
        case .complete: return Color(red: 0.102, green: 0.086, blue: 0.063)
        default: return MentorColors.surfaceVoid
        }
    }

    private func advanceMode() {
        switch mode {
        case .focus:
            mode = cycle == 4 ? .longBreak : .shortBreak
            seconds = mode.durationSec
        case .shortBreak:
            cycle += 1
            mode = .focus
            seconds = mode.durationSec
        case .longBreak:
            mode = .complete
            onSessionDone()
        case .complete:
            cycle = 1
            mode = .focus
            seconds = mode.durationSec
        }
        isRunning = true
        scheduleAlarm()
    }

    private var header: some View {
        HStack {
            Button { onSessionDone() } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(MentorColors.gold)
            }
            .buttonStyle(.plain)
            MentorPill("⊙  POMODORO · 25/5", color: MentorColors.gold)
            Spacer()
            Text("SIKL \(cycle)/4")
                .font(MentorFonts.mono(10))
                .tracking(2)
                .foregroundColor(MentorColors.textMuted)
        }
    }

    private var cycleRow: some View {
        HStack(spacing: 8) {
            ForEach(0..<4, id: \.self) { i in
                Circle()
                    .fill(i < cycle - 1 ? MentorColors.emeraldBright :
                          i == cycle - 1 ? mode.accent : MentorColors.textGhost)
                    .frame(width: i == cycle - 1 ? 12 : 8, height: i == cycle - 1 ? 12 : 8)
            }
        }
    }

    private var mentorCard: some View {
        HStack(alignment: .top, spacing: 10) {
            MentorOrb(size: 24, tone: mode == .focus ? .gold : .emerald, breathing: false)
            Text(mentorText)
                .font(MentorFonts.mentor(13))
                .foregroundColor(MentorColors.textBody)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(mode.accent.opacity(0.05))
                .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(mode.accent.opacity(0.35), lineWidth: 1))
        )
    }

    private var mentorText: String {
        switch mode {
        case .focus:
            return "25 daqiqa — prefrontal kortex eng samaradorli. Bitta narsaga jam bo'l. Chalg'itish bilan urinsa — savol ber: «5 daqiqadan keyin bu narsa muhimmi?»"
        case .shortBreak:
            return "5 daqiqalik dam. Default Mode Network yondi — miyangda fonda muammolarga yechim qidiriladi. Ekranga qaramay, ko'zlaringni 6 metr uzoqqa qarat."
        case .longBreak:
            return "4 sikl bajardingmi — 15 daqiqalik chuqur dam. Sayr qil, suv ich. Bu sikl miyangda dofamin yangidan tiklaydi."
        case .complete:
            return "Bajarding. 4 ta to'liq sikl — 1 soatu 40 daqiqa sof fokus. Bugun sen avvalgi sendan kuchliroq bo'lding."
        }
    }
}

private struct CircularTimer: View {
    let progress: Double
    let digits: String
    let label: String
    let accent: Color

    var body: some View {
        ZStack {
            Circle()
                .stroke(accent.opacity(0.15), lineWidth: 6)
                .frame(width: 240, height: 240)
            Circle()
                .trim(from: 0, to: progress)
                .stroke(accent, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .frame(width: 240, height: 240)
                .animation(.easeInOut(duration: 0.6), value: progress)
            VStack(spacing: 8) {
                Text(digits)
                    .font(.system(size: 56, weight: .light, design: .monospaced))
                    .tracking(2)
                    .foregroundColor(MentorColors.textPrimary)
                Text(label)
                    .font(MentorFonts.mono(10).weight(.semibold))
                    .tracking(5)
                    .foregroundColor(accent)
            }
        }
    }
}

#Preview {
    PomodoroView()
}
