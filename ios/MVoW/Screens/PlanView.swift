import SwiftUI

/// Kunlik eslatmalar ekrani — foydalanuvchi nom + vaqt qo'shadi, har kuni
/// o'sha vaqtda telefon signal beradi (mahalliy bildirishnoma).
struct PlanView: View {
    @ObservedObject private var store = PlanStore.shared
    var onClose: () -> Void = {}

    @State private var newTitle = ""
    @State private var newTime = Date()

    var body: some View {
        ZStack {
            MentorColors.surfaceVoid.ignoresSafeArea()
            VStack(spacing: 16) {
                header
                addCard
                if store.tasks.isEmpty {
                    Spacer()
                    Text("Hali eslatma yo'q.\nVaqt va nom qo'shing — har kuni o'sha vaqtda signal beradi.")
                        .font(MentorFonts.mentor(14))
                        .foregroundColor(MentorColors.textMuted)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 28)
                    Spacer()
                } else {
                    ScrollView {
                        VStack(spacing: 8) {
                            ForEach(store.tasks) { t in row(t) }
                        }
                    }
                }
            }
            .padding(20)
        }
    }

    private var header: some View {
        HStack(spacing: 12) {
            Button { onClose() } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(MentorColors.gold)
            }.buttonStyle(.plain)
            Text("KUNLIK ESLATMALAR")
                .font(MentorFonts.mono(12)).tracking(3)
                .foregroundColor(MentorColors.gold)
            Spacer()
        }
    }

    private var addCard: some View {
        VStack(spacing: 10) {
            TextField("Vazifa nomi (masalan: Sport)", text: $newTitle)
                .font(MentorFonts.mentor(15))
                .foregroundColor(MentorColors.textPrimary)
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 10).fill(Color.white.opacity(0.05))
                        .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(MentorColors.goldDeep, lineWidth: 1))
                )
            HStack(spacing: 12) {
                DatePicker("", selection: $newTime, displayedComponents: .hourAndMinute)
                    .labelsHidden()
                    .colorScheme(.dark)
                Spacer()
                Button {
                    let title = newTitle.trimmingCharacters(in: .whitespaces)
                    guard !title.isEmpty else { return }
                    let c = Calendar.current.dateComponents([.hour, .minute], from: newTime)
                    store.add(title: title, hour: c.hour ?? 9, minute: c.minute ?? 0)
                    newTitle = ""
                } label: {
                    Text("+ Qo'shish")
                        .font(MentorFonts.mono(13).weight(.semibold))
                        .foregroundColor(MentorColors.surfaceVoid)
                        .padding(.horizontal, 16).padding(.vertical, 10)
                        .background(Capsule().fill(MentorColors.gold))
                }.buttonStyle(.plain)
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 14).fill(MentorColors.gold.opacity(0.04))
                .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(MentorColors.gold.opacity(0.25), lineWidth: 1))
        )
    }

    private func row(_ t: PlanTask) -> some View {
        HStack(spacing: 12) {
            Text(t.timeLabel)
                .font(MentorFonts.mono(16))
                .foregroundColor(t.enabled ? MentorColors.gold : MentorColors.textMuted)
                .frame(width: 58, alignment: .leading)
            Text(t.title)
                .font(MentorFonts.mentor(15))
                .foregroundColor(t.enabled ? MentorColors.textPrimary : MentorColors.textMuted)
                .strikethrough(!t.enabled)
            Spacer()
            Button { store.toggle(t) } label: {
                Image(systemName: t.enabled ? "bell.fill" : "bell.slash")
                    .font(.system(size: 14))
                    .foregroundColor(t.enabled ? MentorColors.gold : MentorColors.textMuted)
            }.buttonStyle(.plain)
            Button { store.remove(t) } label: {
                Image(systemName: "trash")
                    .font(.system(size: 13))
                    .foregroundColor(MentorColors.rose)
            }.buttonStyle(.plain)
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 10).fill(Color.white.opacity(0.03))
                .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(MentorColors.goldDeep.opacity(0.3), lineWidth: 1))
        )
    }
}

#Preview { PlanView() }
