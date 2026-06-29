import SwiftUI

/// Onboarding — "Ruxsatlar" (permissions). Mirrors `permissions.html`.
/// iOS uses FamilyControls / Screen Time + Notifications instead of Android's
/// Accessibility + Overlay, but the UX framing is the same.
struct PermissionView: View {
    @State private var granted: Set<String> = []

    var onContinue: () -> Void = {}

    private let items: [PermissionItem] = [
        PermissionItem(
            id: "screentime",
            icon: "hourglass",
            title: "Ekran vaqti (Screen Time)",
            badge: "ENG MUHIM",
            badgeColor: MentorColors.gold,
            desc: "Instagram va boshqa ilovalarni bloklash uchun. Bu'siz fokus mexanizmi ishlamaydi."
        ),
        PermissionItem(
            id: "notifications",
            icon: "bell.fill",
            title: "Bildirishnomalar",
            badge: "KERAK",
            badgeColor: MentorColors.honey,
            desc: "Sessiya boshlanishidan oldin mentor seni ogohlantiradi."
        )
    ]

    var body: some View {
        VoidBackdrop {
            VStack(spacing: 0) {
                Spacer().frame(height: 18)

                MentorPill("🔓  RUXSATLAR")

                Spacer().frame(height: 22)

                Text("yordam uchun ruxsat")
                    .font(MentorFonts.mentor(15))
                    .foregroundColor(MentorColors.honey)
                    .tracking(1)

                // Intro
                HStack(alignment: .top, spacing: 12) {
                    MentorOrb(size: 28)
                    (Text("2 ta ruxsat")
                        .foregroundColor(MentorColors.gold)
                        .fontWeight(.semibold)
                     + Text(" kerak — bularsiz blok ishlamaydi.")
                        .foregroundColor(MentorColors.textBody))
                    .font(MentorFonts.mentor(16))
                    .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)

                Spacer().frame(height: 24)

                ForEach(items) { item in
                    PermissionCard(
                        item: item,
                        granted: granted.contains(item.id),
                        onGrant: {
                            withAnimation(.easeInOut(duration: 0.2)) {
                                _ = granted.insert(item.id)
                            }
                        }
                    )
                    .padding(.horizontal, 24)
                    .padding(.bottom, 12)
                }

                Spacer()

                // Footer counter
                Text("\(granted.count) / \(items.count) RUXSAT BERILDI")
                    .font(MentorFonts.mono(9))
                    .tracking(2)
                    .foregroundColor(MentorColors.goldDeep)
                    .padding(.bottom, 10)

                MentorPrimaryButton(
                    granted.count == items.count ? "Davom etamiz" : "Qolgan ruxsatni ham beraman",
                    enabled: !granted.isEmpty,
                    action: onContinue
                )
                .padding(.horizontal, 24)
                .padding(.bottom, 22)
            }
        }
        .preferredColorScheme(.dark)
    }
}

struct PermissionItem: Identifiable {
    let id: String
    let icon: String
    let title: String
    let badge: String
    let badgeColor: Color
    let desc: String
}

private struct PermissionCard: View {
    let item: PermissionItem
    let granted: Bool
    let onGrant: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                Image(systemName: item.icon)
                    .font(.system(size: 16))
                    .foregroundColor(MentorColors.gold)
                Text(item.title)
                    .font(MentorFonts.mentorBold(16))
                    .foregroundColor(MentorColors.textPrimary)
                Spacer()
                Text(granted ? "✓ BERILGAN" : item.badge)
                    .font(MentorFonts.mono(8))
                    .tracking(1.5)
                    .foregroundColor(granted ? MentorColors.emeraldBright : item.badgeColor)
            }

            Text(item.desc)
                .font(MentorFonts.mentor(13))
                .foregroundColor(MentorColors.textBody)
                .fixedSize(horizontal: false, vertical: true)

            if !granted {
                Button(action: onGrant) {
                    Text("RUXSAT BER")
                        .font(MentorFonts.mono(9))
                        .tracking(2)
                        .foregroundColor(MentorColors.gold)
                        .padding(.vertical, 8)
                        .padding(.horizontal, 16)
                        .overlay(
                            RoundedRectangle(cornerRadius: 4)
                                .strokeBorder(MentorColors.goldDeep, lineWidth: 1)
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(14)
        .background(granted ? MentorColors.emerald.opacity(0.06) : MentorColors.gold.opacity(0.04))
        .overlay(
            RoundedRectangle(cornerRadius: 6)
                .strokeBorder(granted ? MentorColors.emerald.opacity(0.4) : MentorColors.goldDeep.opacity(0.5), lineWidth: 1)
        )
        .cornerRadius(6)
    }
}

#Preview {
    PermissionView()
}
