# Valhalla's Call - The Eternal Battlefield

An epic top-down viking action game where a mighty spirit takes control of a warrior on the eternal battlefield! Fight for 90 intense seconds on an infinite battleground and send as many enemies as possible to Hel!

## ⚔️ About The Game

As a spirit from Asgard, you take control of a viking warrior on the eternal battlefield. Move freely around the infinite battleground while the camera follows you, and fight for honor and glory. Your goal is simple: **Kill as many enemies as possible in 90 seconds**!

### 🏰 Medieval/Viking Features

**Atmosphere & Graphics:**
- ✅ Authentic medieval/viking theme
- ✅ Real sprite graphics (not simple squares)
- ✅ Detailed battlefield with grass, dirt, stones and skulls
- ✅ Atmospheric particles (dust, glow, fire)
- ✅ Epic viking UI with gold and red colors

**Gameplay:**
- ✅ **Infinite battlefield** - camera follows the player for authentic battlefield feeling
- ✅ 2000x2000 pixel large world to explore
- ✅ Intelligent enemy AI that pursues the player
- ✅ Enhanced attack system with visual effects
- ✅ Improved blood and hit effects
- ✅ Screen shake and knockback effects

**Viking Ranking System:**
- ✅ 7 epic viking ranks (Peasant → Einherjar)
- ✅ Based on enemies killed (not damage)
- ✅ Valhalla theme with Norse mythology

## 🏆 Viking Ranking System

Based on number of enemies killed, you are awarded a viking rank:

- **PEASANT** (0+ kills) - Taking your first fight
- **WARRIOR** (3+ kills) - Shows courage on the battlefield  
- **BERSERKER** (8+ kills) - Fights with raging fury
- **JARL** (15+ kills) - Leads other warriors
- **THANE** (25+ kills) - Loyal servant of the king
- **VIKING HERO** (40+ kills) - Legendary throughout the North
- **EINHERJAR** (60+ kills) - Chosen for Odin's hall (Valhalla!)

## 🕹️ Controls

### Desktop
- **WASD** or **Arrow keys** - Move in all directions on the battlefield
- **SPACE** - Attack nearby enemies with your viking steel

### Mobile
- **Virtual Joystick** - Drag to move the warrior
- **⚔ Attack button** - Tap to attack enemies

**Features:**
- ✅ Joystick and buttons follow camera (always visible)
- ✅ Responsive touch feedback
- ✅ Optimized for all screen sizes

## 🛠️ Technologies

- **Phaser.js 3.70.0** - Game engine
- **Capacitor 5.6.0** - Mobile deployment  
- **Vite** - Build tool and development server
- **Vanilla JavaScript** - Programming

## 🚀 Installation and Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Run development server
```bash
npm run dev
```
Open http://localhost:8080 in your browser

### 3. Build for production
```bash
npm run build
```

## 📱 Mobile Deployment

### Android (Google Play)

1. **Add Android platform:**
```bash
npm run capacitor:add:android
```

2. **Build and sync:**
```bash
npm run build:mobile
```

3. **Open Android Studio:**
```bash
npm run capacitor:open:android
```

4. **Run on device/emulator:**
```bash
npm run capacitor:run:android
```

### iOS (App Store)

1. **Add iOS platform:**
```bash
npm run capacitor:add:ios
```

2. **Build and sync:**
```bash
npm run build:mobile
```

3. **Open Xcode:**
```bash
npm run capacitor:open:ios
```

4. **Run on device/simulator:**
```bash
npm run capacitor:run:ios
```

## 📁 Projekt Struktur

```
TheFirstGame/
├── src/
│   ├── scenes/
│   │   ├── MenuScene.js      # Main menu
│   │   └── GameScene.js      # Game scene
│   ├── index.html            # HTML template
│   └── main.js               # Entry point
├── public/                   # Static files
├── dist/                     # Build output
├── android/                  # Android project (after cap add android)
├── ios/                      # iOS project (after cap add ios)
├── package.json              # Dependencies and scripts
├── capacitor.config.json     # Capacitor configuration
└── vite.config.js           # Vite configuration
```

## 🔧 Configuration

### Capacitor App ID
App ID is set to `com.kstau.thefirstgame` - change this in `capacitor.config.json` before deployment.

### App Name
App name is "The First Game" - can be changed in `capacitor.config.json`.

## 📝 Deployment Checklist

### Google Play
- [ ] Generate signed APK/AAB
- [ ] Create Google Play Console account
- [ ] Upload app to Play Console
- [ ] Fill out store listing
- [ ] Set pricing and distribution

### iOS App Store
- [ ] Join Apple Developer Program
- [ ] Configure Xcode with certificates
- [ ] Archive and upload to App Store Connect
- [ ] Fill out App Store metadata
- [ ] Submit for review

## 🐛 Debugging

### Development
```bash
npm run dev
```

### Mobile Debugging
- **Android**: Use Chrome DevTools (chrome://inspect)
- **iOS**: Use Safari Web Inspector

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - see LICENSE file for details.
