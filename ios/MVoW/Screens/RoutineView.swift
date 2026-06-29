import SwiftUI

/// AI-driven planning flow with 4 steps including new habits + scope feature.
/// Mirrors Android `RoutineScreen.kt` (post 2026-05-15 update).
struct RoutineView: View {
    enum Step { case q1Goal, q2Energy, q3Time, q4Habits, generating, plan }
    enum Scope { case today, week }
    struct Answer { let key: String; let icon: String; let name: String }

    @State private var step: Step = .q1Goal
    @State private var goals: Set<String> = []
    @State private var energy: String = ""
    @State private var timeBudget: String = ""
    @State private var habits: Set<String> = []
    @State private var scope: Scope = .today

    var onPlanReady: (String, String, [String], [String], Scope) -> Void = { _, _, _, _, _ in }

    var body: some View {
        ZStack(alignment: .bottom) {
            MentorColors.surfaceVoid.ignoresSafeArea()
            ScrollView {
                VStack(spacing: 16) {
                    header
                    switch step {
                    case .q1Goal: question(text: "Bugun ", emText: "nima", rest: " qilmoqchisan?",
                                           prompt: "— 2-3 ta tanla —", answers: Q1, multi: true)
                    case .q2Energy: question(text: "Hozir ", emText: "qancha kuchli", rest: "san?",
                                              prompt: "", answers: Q2, multi: false)
                    case .q3Time: question(text: "", emText: "Qancha", rest: " vaqting bor?",
                                            prompt: "", answers: Q3, multi: false)
                    case .q4Habits: habitsBlock
                    case .generating: generatingBlock
                    case .plan: planBlock
                    }
                }
                .padding(.horizontal, 20).padding(.top, 32).padding(.bottom, 120)
            }
            bottomBar
        }
        .onChange(of: step) { newValue in
            if newValue == .generating {
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
                    if step == .generating { step = .plan }
                }
            }
        }
    }

    // MARK: header

    private var header: some View {
        let label: String
        let dots: [Bool]
        switch step {
        case .q1Goal: label = "1 / 4 · NIMA"; dots = [true, false, false, false]
        case .q2Energy: label = "2 / 4 · ENERGIYA"; dots = [true, true, false, false]
        case .q3Time: label = "3 / 4 · VAQT"; dots = [true, true, true, false]
        case .q4Habits: label = "4 / 4 · ODATLAR"; dots = [true, true, true, true]
        case .generating: label = "QURMOQDA"; dots = [true, true, true, true]
        case .plan: label = "TAYYOR"; dots = [true, true, true, true]
        }
        return HStack {
            Text("← BEKOR").font(MentorFonts.mono(10)).tracking(2).foregroundColor(MentorColors.textMuted)
            Spacer()
            HStack(spacing: 6) {
                Text(label).font(MentorFonts.mono(9)).tracking(3).foregroundColor(MentorColors.gold)
                ForEach(0..<dots.count, id: \.self) { i in
                    Circle().fill(dots[i] ? MentorColors.gold : MentorColors.textGhost).frame(width: 5, height: 5)
                }
            }
            .padding(.horizontal, 12).padding(.vertical, 6)
            .background(Capsule().fill(MentorColors.gold.opacity(0.06))
                            .overlay(Capsule().strokeBorder(MentorColors.gold.opacity(0.4), lineWidth: 1)))
        }
    }

    // MARK: question

    private func question(text: String, emText: String, rest: String, prompt: String, answers: [Answer], multi: Bool) -> some View {
        VStack(spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                MentorOrb(size: 28, breathing: false)
                HStack(spacing: 0) {
                    if !text.isEmpty { Text(text).font(MentorFonts.mentor(18)).foregroundColor(MentorColors.textPrimary) }
                    Text(emText).font(MentorFonts.mentorBold(18)).foregroundColor(MentorColors.gold)
                    Text(rest).font(MentorFonts.mentor(18)).foregroundColor(MentorColors.textPrimary)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 8).fill(MentorColors.gold.opacity(0.05))
                            .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(MentorColors.gold.opacity(0.4), lineWidth: 1)))
            if !prompt.isEmpty {
                Text(prompt).font(MentorFonts.mentor(11)).foregroundColor(MentorColors.textMuted)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            VStack(spacing: 8) {
                ForEach(answers, id: \.key) { a in
                    AnswerRow(icon: a.icon, name: a.name, selected: isSelected(a.key)) {
                        toggle(a.key, multi: multi)
                    }
                }
            }
        }
    }

    private func isSelected(_ key: String) -> Bool {
        switch step {
        case .q1Goal: return goals.contains(key)
        case .q2Energy: return energy == key
        case .q3Time: return timeBudget == key
        default: return false
        }
    }

    private func toggle(_ key: String, multi: Bool) {
        switch step {
        case .q1Goal:
            if goals.contains(key) { goals.remove(key) }
            else if goals.count < 3 { goals.insert(key) }
        case .q2Energy: energy = key
        case .q3Time: timeBudget = key
        default: break
        }
    }

    // MARK: habits step (NEW)

    private var habitsBlock: some View {
        VStack(spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                MentorOrb(size: 28, breathing: false)
                HStack(spacing: 0) {
                    Text("Doimiy ").font(MentorFonts.mentor(18)).foregroundColor(MentorColors.textPrimary)
                    Text("odatlaring").font(MentorFonts.mentorBold(18)).foregroundColor(MentorColors.gold)
                    Text(" bormi?").font(MentorFonts.mentor(18)).foregroundColor(MentorColors.textPrimary)
                }
            }
            .padding(14).frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 8).fill(MentorColors.gold.opacity(0.05))
                            .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(MentorColors.gold.opacity(0.4), lineWidth: 1)))

            Text("— har kuni qaytariladi · bo'sh qoldirsa yo'q —")
                .font(MentorFonts.mentor(11)).foregroundColor(MentorColors.textMuted)
                .frame(maxWidth: .infinity, alignment: .leading)

            VStack(spacing: 8) {
                ForEach(habitOptions, id: \.key) { h in
                    HabitRow(icon: h.icon, name: h.name, selected: habits.contains(h.key)) {
                        if habits.contains(h.key) { habits.remove(h.key) } else { habits.insert(h.key) }
                    }
                }
            }

            Text("REJA QAMRAGI").font(MentorFonts.mono(9).weight(.semibold)).tracking(4).foregroundColor(MentorColors.goldDeep)
                .frame(maxWidth: .infinity, alignment: .leading).padding(.top, 8)
            HStack(spacing: 8) {
                ScopeChip(text: "☀ Faqat bugun", selected: scope == .today) { scope = .today }
                ScopeChip(text: "↻ 1 hafta", selected: scope == .week) { scope = .week }
            }
        }
    }

    // MARK: generating

    private var generatingBlock: some View {
        VStack(spacing: 20) {
            Circle()
                .strokeBorder(Color(red: 0.486, green: 0.659, blue: 0.788), lineWidth: 2)
                .background(Circle().fill(Color(red: 0.486, green: 0.659, blue: 0.788).opacity(0.20)))
                .frame(width: 90, height: 90)
                .modifier(RotateForever())
            HStack(spacing: 0) {
                Text("Reja tug'ilmoqda").font(MentorFonts.mentorBold(17)).foregroundColor(Color(red: 0.486, green: 0.659, blue: 0.788))
                Text("...").font(MentorFonts.mentor(17)).foregroundColor(MentorColors.textPrimary)
            }
            HStack(spacing: 6) {
                ForEach(0..<3, id: \.self) { _ in
                    Circle().fill(Color(red: 0.486, green: 0.659, blue: 0.788)).frame(width: 8, height: 8)
                }
            }
        }
        .padding(.vertical, 40)
        .frame(maxWidth: .infinity)
    }

    // MARK: plan

    private var planBlock: some View {
        let recurring = habits.compactMap { key in habitOptions.first(where: { $0.key == key }) }
            .map { h in
                GeneratedTask(time: h.defaultTime, name: h.name, meta: "\(h.icon) ODAT · HAR KUN",
                              durationMin: h.durationMin, kind: .focus, recurring: true)
            }
        let all = (recurring + sampleGenerated).sorted { $0.time < $1.time }
        let totalMin = all.reduce(0) { $0 + $1.durationMin }
        let totalLabel = "\(totalMin / 60)S \(totalMin % 60)D"
        let scopeLabel = scope == .week ? "1 HAFTA" : "BUGUN"
        let mainEm = scope == .week ? "haftang" : "bugun"

        return VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 0) {
                Text("REJA TAYYOR").font(MentorFonts.mono(9).weight(.semibold)).tracking(4).foregroundColor(MentorColors.goldFlash)
                Text(" · \(all.count) ISH · \(totalLabel) · \(scopeLabel)")
                    .font(MentorFonts.mono(9)).tracking(4).foregroundColor(MentorColors.emeraldBright)
            }
            HStack(spacing: 0) {
                Text("Mana sening ").font(MentorFonts.mentorBold(20)).foregroundColor(MentorColors.textPrimary)
                Text(mainEm).font(MentorFonts.mentorBold(20)).foregroundColor(MentorColors.emeraldBright)
                Text(".").font(MentorFonts.mentorBold(20)).foregroundColor(MentorColors.textPrimary)
            }
            VStack(spacing: 6) {
                ForEach(Array(all.enumerated()), id: \.offset) { _, t in PlanRow(t: t) }
            }
            mentorNote(habitCount: recurring.count)
        }
    }

    private func mentorNote(habitCount: Int) -> some View {
        let energyLabel = energy == "high" ? "kuchli" : (energy == "tired" ? "tushgan" : "o'rta")
        var extra = ""
        if habitCount > 0 { extra += " \(habitCount) ta doimiy odat — har kuni qaytaradi." }
        if scope == .week { extra += " Bu reja 7 kunga avtomatik chiziladi." }
        return HStack(spacing: 0) {
            Text("Energiyang ").font(MentorFonts.mentor(13)).foregroundColor(MentorColors.textBody)
            Text(energyLabel).font(MentorFonts.mentorBold(13)).foregroundColor(MentorColors.emeraldBright)
            Text(" — chuqur ishni tongga qo'ydim. 11:00 — dam, 14:00 — yana fokus.\(extra)")
                .font(MentorFonts.mentor(13)).foregroundColor(MentorColors.textBody)
        }
        .padding(14)
        .background(RoundedRectangle(cornerRadius: 4).fill(MentorColors.emerald.opacity(0.06))
                        .overlay(RoundedRectangle(cornerRadius: 4).strokeBorder(MentorColors.emerald.opacity(0.4), lineWidth: 1)))
    }

    // MARK: bottom

    private var bottomBar: some View {
        let label: String = {
            switch step {
            case .q1Goal, .q2Energy, .q3Time: return "Keyingi"
            case .q4Habits: return "Reja tuz"
            case .generating: return ""
            case .plan: return "Kunni boshlayman"
            }
        }()
        let canAdvance: Bool = {
            switch step {
            case .q1Goal: return !goals.isEmpty
            case .q2Energy: return !energy.isEmpty
            case .q3Time: return !timeBudget.isEmpty
            case .q4Habits, .plan: return true
            case .generating: return false
            }
        }()
        return Group {
            if !label.isEmpty {
                MentorPrimaryButton(label, enabled: canAdvance) {
                    advance()
                }
                .padding(.horizontal, 20).padding(.vertical, 16)
                .background(MentorColors.surfaceVoid)
            }
        }
    }

    private func advance() {
        switch step {
        case .q1Goal: step = .q2Energy
        case .q2Energy: step = .q3Time
        case .q3Time: step = .q4Habits
        case .q4Habits: step = .generating
        case .generating: step = .plan
        case .plan: onPlanReady(energy, timeBudget, Array(goals), Array(habits), scope)
        }
    }

    // MARK: data

    private let Q1: [Answer] = [
        Answer(key: "work", icon: "◆", name: "Ish · loyiha"),
        Answer(key: "study", icon: "▦", name: "O'qish · imtihon"),
        Answer(key: "sport", icon: "⊙", name: "Sport · tana"),
        Answer(key: "family", icon: "∞", name: "Yaqinlar")
    ]
    private let Q2: [Answer] = [
        Answer(key: "high", icon: "⚡", name: "Kuchli"),
        Answer(key: "medium", icon: "🌥", name: "O'rta"),
        Answer(key: "tired", icon: "🌙", name: "Charchadim")
    ]
    private let Q3: [Answer] = [
        Answer(key: "short", icon: "⊙", name: "3-4 soat"),
        Answer(key: "normal", icon: "∼", name: "6-8 soat"),
        Answer(key: "open", icon: "∞", name: "10+ soat")
    ]

    struct HabitOption { let key: String; let icon: String; let name: String; let defaultTime: String; let durationMin: Int }
    private let habitOptions: [HabitOption] = [
        .init(key: "morning_prayer", icon: "☾", name: "Tonggi namoz", defaultTime: "05:30", durationMin: 15),
        .init(key: "morning_light", icon: "☀", name: "Tonggi quyosh · 5 daq", defaultTime: "06:30", durationMin: 5),
        .init(key: "sport", icon: "⊙", name: "Sport · harakat", defaultTime: "07:00", durationMin: 30),
        .init(key: "reading", icon: "▥", name: "Mutolaa · 30 daq", defaultTime: "21:30", durationMin: 30),
        .init(key: "sleep_anchor", icon: "☽", name: "Uyqu vaqti — telefon o'chadi", defaultTime: "22:30", durationMin: 5)
    ]

    enum PlanKind { case focus, intense, rest }
    struct GeneratedTask { let time: String; let name: String; let meta: String; let durationMin: Int; let kind: PlanKind; let recurring: Bool }
    private let sampleGenerated: [GeneratedTask] = [
        .init(time: "07:00", name: "Yugurish · 5 km", meta: "⊙ TANANI UYG'OTISH", durationMin: 45, kind: .focus, recurring: false),
        .init(time: "09:00", name: "Imtihonga tayyorlanish", meta: "▦ POMODORO · 4 SIKL", durationMin: 120, kind: .intense, recurring: false),
        .init(time: "11:00", name: "Dam · sayr", meta: "∼ HAVODA YURISH", durationMin: 15, kind: .rest, recurring: false),
        .init(time: "14:00", name: "Loyiha · kod yozish", meta: "◆ CHUQUR ISH", durationMin: 60, kind: .focus, recurring: false),
        .init(time: "19:00", name: "Oilaga vaqt · birga ovqat", meta: "∞ TELEFONSIZ", durationMin: 45, kind: .focus, recurring: false)
    ]
}

private struct AnswerRow: View {
    let icon: String, name: String, selected: Bool
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Text(icon).font(.system(size: 18))
                    .foregroundColor(selected ? MentorColors.gold : MentorColors.textBody)
                Text(name).font(.system(size: 14, weight: selected ? .semibold : .regular))
                    .foregroundColor(selected ? MentorColors.textPrimary : MentorColors.textBody)
                Spacer()
            }
            .padding(.horizontal, 14).padding(.vertical, 14)
            .background(RoundedRectangle(cornerRadius: 8)
                .fill(selected ? MentorColors.gold.opacity(0.15) : Color.white.opacity(0.03))
                .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(selected ? MentorColors.gold : MentorColors.textGhost, lineWidth: 1)))
        }
    }
}

private struct HabitRow: View {
    let icon: String, name: String, selected: Bool
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Text(icon).font(.system(size: 18))
                    .foregroundColor(selected ? MentorColors.gold : MentorColors.textBody)
                Text(name).font(.system(size: 14, weight: selected ? .semibold : .regular))
                    .foregroundColor(selected ? MentorColors.textPrimary : MentorColors.textBody)
                Spacer()
                if selected { Text("↻").font(.system(size: 16)).foregroundColor(MentorColors.gold) }
            }
            .padding(.horizontal, 14).padding(.vertical, 12)
            .background(RoundedRectangle(cornerRadius: 8)
                .fill(selected ? MentorColors.gold.opacity(0.15) : Color.white.opacity(0.03))
                .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(selected ? MentorColors.gold : MentorColors.textGhost, lineWidth: 1)))
        }
    }
}

private struct ScopeChip: View {
    let text: String, selected: Bool
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(text)
                .font(.system(size: 12, weight: selected ? .semibold : .regular))
                .tracking(1)
                .foregroundColor(selected ? MentorColors.gold : MentorColors.textBody)
                .frame(maxWidth: .infinity, minHeight: 44)
                .background(RoundedRectangle(cornerRadius: 8)
                    .fill(selected ? MentorColors.gold.opacity(0.18) : Color.white.opacity(0.03))
                    .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(selected ? MentorColors.gold : MentorColors.textGhost, lineWidth: 1)))
        }
    }
}

private struct PlanRow: View {
    let t: RoutineView.GeneratedTask
    private var border: Color {
        if t.recurring { return MentorColors.gold.opacity(0.5) }
        switch t.kind {
        case .intense: return MentorColors.crimson.opacity(0.3)
        case .rest: return Color(red: 0.486, green: 0.659, blue: 0.788).opacity(0.3)
        case .focus: return MentorColors.emerald.opacity(0.3)
        }
    }
    private var bg: Color {
        if t.recurring { return MentorColors.gold.opacity(0.08) }
        switch t.kind {
        case .intense: return MentorColors.crimson.opacity(0.05)
        case .rest: return Color(red: 0.486, green: 0.659, blue: 0.788).opacity(0.05)
        case .focus: return MentorColors.emerald.opacity(0.05)
        }
    }
    private var timeColor: Color {
        if t.recurring { return MentorColors.gold }
        switch t.kind {
        case .intense: return MentorColors.crimson
        case .rest: return Color(red: 0.486, green: 0.659, blue: 0.788)
        case .focus: return MentorColors.gold
        }
    }
    var body: some View {
        HStack(spacing: 10) {
            VStack(spacing: 2) {
                Text(t.time).font(MentorFonts.mono(11).weight(.semibold)).tracking(1).foregroundColor(timeColor)
                Text("\(t.durationMin) daq").font(.system(size: 8)).foregroundColor(MentorColors.goldDeep)
            }
            .frame(width: 54)
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(t.name).font(.system(size: 14, weight: .semibold)).foregroundColor(MentorColors.textPrimary)
                    Spacer()
                    if t.recurring { Text("↻").font(.system(size: 14, weight: .bold)).foregroundColor(MentorColors.gold) }
                }
                Text(t.meta).font(MentorFonts.mono(8)).tracking(1).foregroundColor(MentorColors.goldDeep)
                DurationBar(min: t.durationMin, accent: timeColor)
            }
        }
        .padding(.horizontal, 12).padding(.vertical, 10)
        .background(RoundedRectangle(cornerRadius: 8).fill(bg)
                        .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(border, lineWidth: 1)))
    }
}

private struct DurationBar: View {
    let min: Int
    let accent: Color
    var body: some View {
        let f = max(0.1, min.fraction)
        HStack(spacing: 8) {
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2).fill(accent.opacity(0.18)).frame(height: 4)
                    RoundedRectangle(cornerRadius: 2).fill(accent).frame(width: geo.size.width * f, height: 4)
                }
            }
            .frame(height: 4)
            Text(min >= 60 ? "\(min/60)S" : "\(min)D")
                .font(.system(size: 9, weight: .semibold)).foregroundColor(accent)
        }
    }
}

private extension Int {
    var fraction: CGFloat { CGFloat(Swift.min(self, 120)) / 120.0 }
}

private struct RotateForever: ViewModifier {
    @State private var rot: Double = 0
    func body(content: Content) -> some View {
        content.rotationEffect(.degrees(rot))
            .onAppear {
                withAnimation(.linear(duration: 8).repeatForever(autoreverses: false)) {
                    rot = 360
                }
            }
    }
}

#Preview {
    RoutineView()
}
