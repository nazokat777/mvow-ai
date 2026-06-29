import SwiftUI

/// Mentor chat — open conversation. Mirrors Android `ChatScreen.kt`.
struct ChatView: View {
    enum Role { case user, mentor }

    struct Message: Identifiable {
        let id = UUID()
        let role: Role
        let text: String
        let timestamp: String
        let wisdomTitle: String?
        let wisdomBody: String?
        let actionLabel: String?
        let isVoice: Bool
        let voiceDuration: String?

        init(role: Role, text: String, timestamp: String,
             wisdomTitle: String? = nil, wisdomBody: String? = nil,
             actionLabel: String? = nil,
             isVoice: Bool = false, voiceDuration: String? = nil) {
            self.role = role
            self.text = text
            self.timestamp = timestamp
            self.wisdomTitle = wisdomTitle
            self.wisdomBody = wisdomBody
            self.actionLabel = actionLabel
            self.isVoice = isVoice
            self.voiceDuration = voiceDuration
        }
    }

    @State private var messages: [Message] = ChatView.seed
    @State private var draft: String = ""
    @State private var isTyping: Bool = false

    var onClose: () -> Void = {}

    var body: some View {
        ZStack {
            Color(red: 0.039, green: 0.031, blue: 0.063).ignoresSafeArea()

            VStack(spacing: 0) {
                topBar
                ScrollViewReader { proxy in
                    ScrollView {
                        VStack(spacing: 10) {
                            DayDivider(label: "— BUGUN · 14:30 —")
                            ForEach(messages) { msg in
                                if msg.role == .user {
                                    UserMessageView(msg: msg).id(msg.id)
                                } else {
                                    MentorMessageView(msg: msg).id(msg.id)
                                }
                            }
                            if isTyping {
                                TypingIndicator()
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                    }
                    .onChange(of: messages.count) { _ in
                        if let last = messages.last {
                            withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                        }
                    }
                }
                quickPrompts
                inputBar
            }
        }
    }

    private var topBar: some View {
        HStack(spacing: 16) {
            Button(action: onClose) {
                Text("←").font(.system(size: 22)).foregroundColor(MentorColors.textMuted)
            }
            MentorOrb(size: 36, breathing: true)
            VStack(alignment: .leading, spacing: 2) {
                Text("Murabbiy")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(MentorColors.textPrimary)
                HStack(spacing: 6) {
                    Circle().fill(MentorColors.emeraldBright).frame(width: 6, height: 6)
                    Text("yonida")
                        .font(MentorFonts.mono(10))
                        .tracking(2)
                        .foregroundColor(MentorColors.emeraldBright)
                }
            }
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(Color(red: 0.071, green: 0.055, blue: 0.094))
    }

    private var quickPrompts: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(["⚡ Charchadim", "◇ Yo'lim qaerda?", "∼ Niyatim kuchsizlandi", "☾ Uxlay olmayapman", "+ Boshqa savol"], id: \.self) { p in
                    Button {
                        sendUser(p)
                    } label: {
                        Text(p)
                            .font(.system(size: 11))
                            .foregroundColor(MentorColors.textBody)
                            .padding(.horizontal, 12).padding(.vertical, 8)
                            .background(Capsule().fill(Color.white.opacity(0.04))
                                            .overlay(Capsule().strokeBorder(MentorColors.textGhost, lineWidth: 1)))
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
        }
    }

    private var inputBar: some View {
        HStack(spacing: 8) {
            ZStack(alignment: .leading) {
                if draft.isEmpty {
                    Text("Murabbiyga ayt...")
                        .font(MentorFonts.mentor(13))
                        .foregroundColor(MentorColors.textMuted)
                }
                TextField("", text: $draft)
                    .font(.system(size: 13))
                    .foregroundColor(MentorColors.textPrimary)
            }
            .padding(.horizontal, 14)
            .frame(minHeight: 40)
            .background(
                Capsule()
                    .fill(Color.white.opacity(0.04))
                    .overlay(Capsule().strokeBorder(MentorColors.textGhost, lineWidth: 1))
            )

            Button {} label: {
                Image(systemName: "mic.fill")
                    .foregroundColor(MentorColors.gold)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(Color.white.opacity(0.04))
                                    .overlay(Circle().strokeBorder(MentorColors.gold.opacity(0.6), lineWidth: 1)))
            }
            Button {
                guard !draft.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                sendUser(draft.trimmingCharacters(in: .whitespaces))
                draft = ""
            } label: {
                Image(systemName: "paperplane.fill")
                    .foregroundColor(.black)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(MentorColors.gold))
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Color(red: 0.071, green: 0.055, blue: 0.094))
    }

    private func sendUser(_ text: String) {
        messages.append(Message(role: .user, text: text, timestamp: "hozir"))
        isTyping = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            isTyping = false
            messages.append(Message(
                role: .mentor,
                text: "Tushundim. Bir savol — keyingi 5 daqiqada sen nima qila olasan?",
                timestamp: "hozir"
            ))
        }
    }

    static let seed: [Message] = [
        Message(role: .user, text: "Charchadim. Hech narsani boshlay olmayapman.", timestamp: "14:30"),
        Message(role: .mentor, text: "Tan oldim. Charchoq — signal, jazo emas. Bir savol bersam — javob berasanmi?", timestamp: "14:31"),
        Message(role: .mentor, text: "Bugun qaysi paytda oxirgi marta o'zingni kuchli his qilding?", timestamp: "14:31"),
        Message(role: .user, text: "", timestamp: "14:32", isVoice: true, voiceDuration: "0:09"),
        Message(role: .mentor,
                text: "Ko'rdingmi? Sen ertalabki yugurishdan keyin kuchli eding. Kuch — buyurtmalik narsa emas, lekin qayta chaqirilishi mumkin.",
                timestamp: "14:32",
                wisdomTitle: "NEYROBIOLOG · DOPAMIN",
                wisdomBody: "Yugurish kortizolni tushiradi, dopaminni ko'taradi. Bu — eng oson energiya kaliti. 5-10 daqiqa kifoya."),
        Message(role: .mentor, text: "2 daqiqalik qadam — qaysi? Hozir.", timestamp: "14:33", actionLabel: "⚡ KICHIK QADAM TANLAY")
    ]
}

private struct DayDivider: View {
    let label: String
    var body: some View {
        HStack(spacing: 10) {
            Rectangle().fill(MentorColors.textGhost).frame(height: 1)
            Text(label).font(MentorFonts.mono(9)).tracking(3).foregroundColor(MentorColors.textMuted)
            Rectangle().fill(MentorColors.textGhost).frame(height: 1)
        }
    }
}

private struct UserMessageView: View {
    let msg: ChatView.Message
    var body: some View {
        HStack {
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Group {
                    if msg.isVoice {
                        VoiceBubble(duration: msg.voiceDuration ?? "0:09")
                    } else {
                        Text(msg.text)
                            .font(.system(size: 14))
                            .foregroundColor(MentorColors.textPrimary)
                            .lineSpacing(3)
                    }
                }
                .padding(.horizontal, 14).padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(MentorColors.gold.opacity(0.18))
                        .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(MentorColors.gold.opacity(0.5), lineWidth: 1))
                )
                Text("\(msg.timestamp)  ✓")
                    .font(.system(size: 9))
                    .foregroundColor(MentorColors.textMuted)
            }
        }
    }
}

private struct VoiceBubble: View {
    let duration: String
    var body: some View {
        HStack(spacing: 10) {
            Circle().fill(MentorColors.gold).frame(width: 28, height: 28)
                .overlay(Image(systemName: "play.fill").font(.system(size: 10)).foregroundColor(.black))
            HStack(spacing: 2) {
                ForEach([4, 8, 14, 10, 16, 12, 6, 11, 14, 8, 4, 9, 13, 7, 5], id: \.self) { h in
                    Rectangle().fill(MentorColors.gold).frame(width: 2, height: CGFloat(h))
                }
            }
            Text(duration).font(MentorFonts.mono(11)).foregroundColor(MentorColors.gold)
        }
    }
}

private struct MentorMessageView: View {
    let msg: ChatView.Message
    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            MentorOrb(size: 28, breathing: false)
            VStack(alignment: .leading, spacing: 2) {
                VStack(alignment: .leading, spacing: 10) {
                    Text(msg.text)
                        .font(MentorFonts.mentor(14))
                        .foregroundColor(MentorColors.textPrimary)
                        .lineSpacing(4)
                    if let title = msg.wisdomTitle, let body = msg.wisdomBody {
                        WisdomEmbed(title: title, text: body)
                    }
                    if let action = msg.actionLabel {
                        ActionEmbed(label: action)
                    }
                }
                .padding(.horizontal, 14).padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.white.opacity(0.04))
                        .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(MentorColors.textGhost, lineWidth: 1))
                )
                Text(msg.timestamp).font(.system(size: 9)).foregroundColor(MentorColors.textMuted)
            }
            Spacer()
        }
    }
}

private struct WisdomEmbed: View {
    let title: String
    let text: String
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(MentorFonts.mono(8).weight(.semibold)).tracking(3).foregroundColor(MentorColors.goldDeep)
            Text(text)
                .font(MentorFonts.mentor(12))
                .foregroundColor(MentorColors.textBody)
                .lineSpacing(3)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(MentorColors.gold.opacity(0.06))
                .overlay(RoundedRectangle(cornerRadius: 6).strokeBorder(MentorColors.gold.opacity(0.4), lineWidth: 1))
        )
    }
}

private struct ActionEmbed: View {
    let label: String
    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundColor(MentorColors.gold)
            Spacer()
            Text("→").foregroundColor(MentorColors.gold)
        }
        .padding(.horizontal, 12).padding(.vertical, 10)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(MentorColors.gold.opacity(0.12))
                .overlay(RoundedRectangle(cornerRadius: 6).strokeBorder(MentorColors.gold, lineWidth: 1))
        )
    }
}

private struct TypingIndicator: View {
    var body: some View {
        HStack(spacing: 8) {
            MentorOrb(size: 28, breathing: true)
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { _ in
                    Circle().fill(MentorColors.gold.opacity(0.6)).frame(width: 6, height: 6)
                }
            }
            .padding(.horizontal, 14).padding(.vertical, 10)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(Color.white.opacity(0.04))
                    .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(MentorColors.textGhost, lineWidth: 1))
            )
            Spacer()
        }
    }
}

#Preview {
    ChatView()
}
