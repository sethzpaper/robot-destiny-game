# Steel Robot Destiny — Unity Setup Guide

## Requirements
- Unity 6.x (or 2022 LTS)
- TextMeshPro (Package Manager)
- No additional plugins needed for the prototype

## Project Setup

### 1. Create Unity Project
```
File → New Project → 2D (URP or Built-in)
Name: SteelRobotDestiny
```

### 2. Copy Scripts
Copy `unity-src/Scripts/` into your Unity project `Assets/Scripts/`.

### 3. Create ScriptableObject Card Assets
For each card (Iron Scout, Data Mage, etc.):
```
Right-click in Project → Create → SRD → Card Data
```
Fill in: cardId, cardName, thaiName, cost, atk, def, tarotName, tarotRoman,
artwork (assign Tarot placeholder sprite), factionColor, abilityId, abilityDescription.

### 4. Create Deck Definitions
```
Right-click → Create → SRD → Deck Definition
```
Add entries: select card + copies (max 3 per card type). Build 40-card deck:
- Iron Scout ×2, Data Mage ×2, Battle Chassis ×2, Titan Frame ×2,
  Lone Sentinel ×2, Command Fortress ×2, Coolant Engine ×1, Dark Processor ×1
- System Crash ×2, Data Surge ×2, Emergency Repair ×2, Overclock ×2, Network Boost ×2
- Plasma Blade ×2, Nano Armor ×2, Turbo Core ×2
- Steel Core ×3, Circuit Node ×3, Plasma Cell ×2, Void Shard ×2

### 5. Scene Setup (Hierarchy)
```
GameManager (empty GameObject)
  └─ GameManager.cs  ← attach script, wire playerDeck / aiDeck
  └─ GameUI.cs       ← wire all UI references

Canvas (Screen Space - Overlay)
  ├─ AiArea
  │   ├─ AiHandContainer (HorizontalLayoutGroup)
  │   └─ AiFieldContainer (HorizontalLayoutGroup)
  ├─ PhaseBar (TextMeshPro)
  ├─ CenterPanel
  │   ├─ AdvanceButton (Button)
  │   └─ MessageText (TextMeshPro)
  ├─ PlayerArea
  │   ├─ PlayerFieldContainer (HorizontalLayoutGroup)
  │   └─ PlayerHandContainer (HorizontalLayoutGroup)
  ├─ HUD
  │   ├─ PlayerHp, PlayerEnergy, PlayerDeck
  │   └─ AiHp, AiEnergy, AiDeck
  ├─ LogPanel (ScrollRect)
  │   └─ LogContainer (VerticalLayoutGroup)
  └─ GameOverPanel (initially inactive)
      ├─ GameOverText (TextMeshPro)
      └─ RestartButton (Button)
```

### 6. Card Prefab Setup
Create a `CardPrefab`:
- Root: Image (card background) + Button + CardUI.cs
- Children: ArtworkImage, TarotRomanText, CostText, NameText, ThaiNameText,
  TypeBadge (Image + TypeText), StatsRow (AtkText + HpText), AbilityText,
  SelectionGlow (Image, inactive by default), TappedOverlay (dark Image)

Recommended card size: 120×170 px in canvas units.

### 7. Tarot Placeholder Images
Download free Rider-Waite Tarot images (public domain) and import as Sprites.
Assign to each CardData.artwork in Inspector.
Later replace with AI-generated robot art.

### 8. Faction Colors (Inspector)
- Steel:   #64748B (slate)
- Circuit: #065F46 (emerald dark)
- Plasma:  #9A3412 (orange dark)
- Void:    #4C1D95 (purple dark)

## Card abilityId Reference
| abilityId          | Effect |
|--------------------|--------|
| draw1              | Draw 1 card |
| draw2              | Draw 2 cards |
| haste              | No summoning sickness |
| heal15             | Caster +15 HP |
| heal_self_20       | Caster +20 HP (program) |
| damage_player_15   | Opponent -15 HP direct |
| damage_unit_5      | Target enemy unit -5 HP |
| boost_atk_3        | Target friendly unit +3 ATK this turn |
| stat_atk_3         | Upgrade: +3 ATK permanent |
| stat_def_3         | Upgrade: +3 DEF/HP permanent |
| stat_atk_2_def_2   | Upgrade: +2 ATK +2 DEF permanent |
| add_core           | Core: +1 max energy permanent |
