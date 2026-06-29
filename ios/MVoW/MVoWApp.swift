import SwiftUI

@main
struct MVoWApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
                .environmentObject(NotificationManager.shared)
                .onAppear { NotificationManager.shared.configure() }
        }
    }
}

/// Root navigation. Real app would use a state machine to decide
/// which screen to show: onboarding → home → session etc.
struct ContentView: View {
    @State private var screen: Screen = .welcome

    enum Screen { case welcome, home }

    var body: some View {
        switch screen {
        case .welcome:
            WelcomeView(onStart: {
                withAnimation(.easeInOut(duration: 0.6)) { screen = .home }
            })
            .transition(.opacity)
        case .home:
            HomeView().transition(.opacity)
        }
    }
}

#Preview { ContentView() }
