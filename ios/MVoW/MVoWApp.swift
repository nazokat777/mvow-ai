import SwiftUI

@main
struct MVoWApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
                .environmentObject(NotificationManager.shared)
                .onAppear {
                    NotificationManager.shared.configure()
                    PlanStore.shared.reschedule()
                }
        }
    }
}

/// Root navigation. Real app would use a state machine to decide
/// which screen to show: onboarding → home → session etc.
enum AppScreen { case welcome, home, pomodoro, plan }

struct ContentView: View {
    @State private var screen: AppScreen = .welcome

    var body: some View {
        Group {
            switch screen {
            case .welcome:
                WelcomeView(onStart: { go(.home) })
            case .home:
                HomeView(onNavigate: { go($0) })
            case .pomodoro:
                PomodoroView(onSessionDone: { go(.home) })
            case .plan:
                PlanView(onClose: { go(.home) })
            }
        }
        .transition(.opacity)
    }

    private func go(_ s: AppScreen) {
        withAnimation(.easeInOut(duration: 0.35)) { screen = s }
    }
}

#Preview { ContentView() }
