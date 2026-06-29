import SwiftUI

/// Daily home dashboard. Mirrors `home.html`.
struct HomeView: View {
    var onNavigate: (AppScreen) -> Void = { _ in }
    var body: some View {
        VoidBackdrop {
            VStack(spacing: 14) {
                // Header
                HStack {
                    HStack(spacing: 8) {
                        BrandShield()
                        Text("M-VoW")
                            .font(.system(size: 14, weight: .bold))
                            .tracking(4)
                            .foregroundColor(MentorColors.textPrimary)
                    }
                    Spacer()
                    HStack(spacing: 8) {
                        StatusPill()
                        IconButton(symbol: "gearshape")
                    }
                }

                // Greeting
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Text("Salom,")
                            .font(MentorFonts.mentor(22))
                            .foregroundColor(MentorColors.textPrimary)
                        Text("Aziz")
                            .font(MentorFonts.mentor(22))
                            .foregroundColor(MentorColors.gold)
                        Text(".")
                            .font(MentorFonts.mentor(22))
                            .foregroundColor(MentorColors.textPrimary)
                        Spacer()
                    }
                    HStack(spacing: 6) {
                        Text("10 MAY · DUSHANBA")
                            .font(MentorFonts.mono(9))
                            .tracking(2)
                            .foregroundColor(MentorColors.goldDeep)
                        Text("·").foregroundColor(MentorColors.textGhost)
                        Text("14:30")
                            .font(MentorFonts.mono(9))
                            .tracking(2)
                            .foregroundColor(MentorColors.gold)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                // Streak hero
                StreakHeroCard()

                // Next session card — bosilsa fokusni boshlaydi
                Button { onNavigate(.pomodoro) } label: { NextSessionCard() }
                    .buttonStyle(.plain)

                // Stats grid
                HStack(spacing: 6) {
                    StatMini(value: "3.5", unit: "SOAT", label: "BUGUN\nFOKUS")
                    StatMini(value: "47", unit: "SOAT", label: "SHU HAFTA\nFOKUS")
                    StatMini(value: "2", unit: "", label: "CHEKINISH\nHAFT")
                }

                Spacer()

                // Bottom nav
                BottomNav(onNavigate: onNavigate)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 22)
        }
        .preferredColorScheme(.dark)
    }
}

// MARK: - Components

private struct BrandShield: View {
    var body: some View {
        Canvas { ctx, size in
            let path = Path { p in
                let w = size.width, h = size.height
                p.move(to: CGPoint(x: w/2, y: 0))
                p.addLine(to: CGPoint(x: w, y: h * 0.25))
                p.addLine(to: CGPoint(x: w, y: h * 0.64))
                p.addQuadCurve(to: CGPoint(x: w/2, y: h),
                               control: CGPoint(x: w, y: h * 0.85))
                p.addQuadCurve(to: CGPoint(x: 0, y: h * 0.64),
                               control: CGPoint(x: 0, y: h * 0.85))
                p.addLine(to: CGPoint(x: 0, y: h * 0.25))
                p.closeSubpath()
            }
            ctx.stroke(path, with: .color(MentorColors.gold), lineWidth: 1.5)
            let center = CGRect(x: size.width/2 - 1.5, y: size.height/2 - 1.5,
                                width: 3, height: 3)
            ctx.fill(Path(ellipseIn: center), with: .color(MentorColors.gold))
        }
        .frame(width: 18, height: 18)
    }
}

private struct StatusPill: View {
    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(MentorColors.emerald)
                .frame(width: 5, height: 5)
                .shadow(color: MentorColors.emerald, radius: 3)
            Text("FOKUS REJIMI")
                .font(MentorFonts.mono(9))
                .tracking(2)
                .foregroundColor(MentorColors.gold)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .overlay(
            RoundedRectangle(cornerRadius: 2)
                .strokeBorder(MentorColors.goldDeep, lineWidth: 1)
        )
        .background(MentorColors.gold.opacity(0.04))
        .cornerRadius(2)
    }
}

private struct IconButton: View {
    let symbol: String
    var body: some View {
        Image(systemName: symbol)
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(MentorColors.gold)
            .frame(width: 28, height: 28)
            .background(MentorColors.gold.opacity(0.04))
            .overlay(Circle().strokeBorder(MentorColors.goldDeep, lineWidth: 1))
            .clipShape(Circle())
    }
}

private struct StreakHeroCard: View {
    @State private var num: Int = 0
    var body: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 2) {
                Text("FOKUS STREAK")
                    .font(MentorFonts.mono(8.5))
                    .tracking(4)
                    .foregroundColor(MentorColors.goldDeep)
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("\(num)")
                        .font(MentorFonts.mono(44))
                        .foregroundColor(MentorColors.gold)
                        .shadow(color: MentorColors.gold.opacity(0.5), radius: 8)
                    Text("KUN")
                        .font(MentorFonts.mono(14))
                        .tracking(3)
                        .foregroundColor(MentorColors.goldDeep)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                HStack(spacing: 3) {
                    ForEach(0..<7, id: \.self) { i in
                        Circle()
                            .fill(i < 4 ? MentorColors.gold : (i == 4 ? MentorColors.goldFlash : .clear))
                            .frame(width: 8, height: 8)
                            .overlay(
                                Circle().strokeBorder(MentorColors.goldDeep, lineWidth: i >= 5 ? 1 : 0)
                            )
                            .shadow(color: i == 4 ? MentorColors.gold : .clear, radius: 4)
                    }
                }
                Text("SHU HAFTA")
                    .font(MentorFonts.mono(7.5))
                    .tracking(1.5)
                    .foregroundColor(MentorColors.goldDeep)
            }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 14)
        .background(MentorColors.gold.opacity(0.03))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .strokeBorder(MentorColors.gold.opacity(0.30), lineWidth: 1)
        )
        .cornerRadius(4)
        .onAppear {
            withAnimation(.linear(duration: 1.0)) {
                // count up — simple snap; fancier counters can use Timer
                num = 12
            }
        }
    }
}

private struct NextSessionCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                HStack(spacing: 5) {
                    Circle()
                        .fill(MentorColors.crimson)
                        .frame(width: 4, height: 4)
                        .shadow(color: MentorColors.crimson, radius: 3)
                    Text("MUQADDAS · KEYINGI")
                        .font(MentorFonts.mono(8))
                        .tracking(3)
                        .foregroundColor(MentorColors.crimson)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .overlay(Capsule().strokeBorder(MentorColors.crimson, lineWidth: 1))
                .background(MentorColors.crimson.opacity(0.10))
                .clipShape(Capsule())
                Spacer()
                Text("14:30 — boshlandi")
                    .font(MentorFonts.mono(11))
                    .foregroundColor(MentorColors.gold)
            }
            Text("Qur'on darsi")
                .font(MentorFonts.mentor(22, italic: false))
                .fontWeight(.semibold)
                .foregroundColor(MentorColors.textPrimary)
            Text("Bugun yana bir bobni o'zlashtirib, kechagi bilimingni mustahkamlash")
                .font(MentorFonts.mentor(13))
                .foregroundColor(MentorColors.textMuted)
                .lineSpacing(2)
            HStack(spacing: 12) {
                Label("14:30 — 15:15", systemImage: "circle.dotted")
                    .labelStyle(.titleOnly)
                Text("· 45 DAQ")
                Text("· SOLO")
            }
            .font(MentorFonts.mono(9))
            .tracking(1.5)
            .foregroundColor(MentorColors.goldDeep)
        }
        .padding(16)
        .background(
            LinearGradient(
                colors: [MentorColors.crimson.opacity(0.08), MentorColors.gold.opacity(0.06)],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .strokeBorder(MentorColors.crimson.opacity(0.30), lineWidth: 1)
        )
        .cornerRadius(4)
    }
}

private struct StatMini: View {
    let value: String
    let unit: String
    let label: String
    var body: some View {
        VStack(spacing: 4) {
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(value)
                    .font(MentorFonts.mono(18))
                    .foregroundColor(MentorColors.gold)
                if !unit.isEmpty {
                    Text(unit)
                        .font(MentorFonts.mono(10))
                        .foregroundColor(MentorColors.goldDeep)
                }
            }
            Text(label)
                .font(MentorFonts.mono(7.5))
                .tracking(1.5)
                .foregroundColor(MentorColors.goldDeep)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(MentorColors.gold.opacity(0.04))
        .overlay(
            RoundedRectangle(cornerRadius: 3)
                .strokeBorder(MentorColors.goldDeep.opacity(0.3), lineWidth: 1)
        )
        .cornerRadius(3)
    }
}

private struct BottomNav: View {
    var onNavigate: (AppScreen) -> Void = { _ in }
    var body: some View {
        HStack {
            NavItem(symbol: "house.fill", label: "UY", active: true)
            NavItem(symbol: "calendar", label: "KALENDAR")
            // Center FAB — fokusni boshlash
            Button { onNavigate(.pomodoro) } label: {
                Image(systemName: "plus")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(MentorColors.surfaceVoid)
                    .frame(width: 42, height: 42)
                    .background(
                        LinearGradient(colors: [MentorColors.goldFlash, MentorColors.gold, MentorColors.gold2],
                                       startPoint: .top, endPoint: .bottom)
                    )
                    .clipShape(Circle())
                    .shadow(color: MentorColors.gold.opacity(0.4), radius: 8)
            }
            .buttonStyle(.plain)
            .offset(y: -22)

            NavItem(symbol: "chart.line.uptrend.xyaxis", label: "YO'L")
            NavItem(symbol: "person.circle", label: "SEN")
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(MentorColors.surfaceShadow.opacity(0.7))
        .overlay(
            Capsule().strokeBorder(MentorColors.goldDeep.opacity(0.3), lineWidth: 1)
        )
        .clipShape(Capsule())
    }
}

private struct NavItem: View {
    let symbol: String
    let label: String
    var active: Bool = false
    var body: some View {
        VStack(spacing: 2) {
            Image(systemName: symbol)
                .font(.system(size: 15, weight: .regular))
                .foregroundColor(active ? MentorColors.gold : MentorColors.textMuted)
            Text(label)
                .font(MentorFonts.mono(7))
                .tracking(1.5)
                .foregroundColor(active ? MentorColors.gold : MentorColors.textMuted)
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    HomeView()
}
