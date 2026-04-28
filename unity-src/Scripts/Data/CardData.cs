using UnityEngine;

namespace SteelRobotDestiny
{
    public enum CardType { Unit, Program, Upgrade, Core }
    public enum Faction { Steel, Circuit, Plasma, Void }
    public enum EffectTrigger { OnPlay, Passive }

    [CreateAssetMenu(fileName = "NewCard", menuName = "SRD/Card Data")]
    public class CardData : ScriptableObject
    {
        [Header("Identity")]
        public string cardId;
        public string cardName;
        public string thaiName;
        public CardType cardType;
        public Faction faction;

        [Header("Cost & Stats")]
        public int cost;
        public int atk;
        public int def;    // also = max HP for units

        [Header("Tarot Theme")]
        public string tarotName;
        public string tarotRoman;
        public Sprite artwork;   // assign Tarot/AI image here in Inspector
        public Color factionColor = Color.white;

        [Header("Ability")]
        public bool hasAbility;
        public EffectTrigger abilityTrigger;
        public string abilityId;   // matched in CardEffectResolver
        [TextArea(2, 4)]
        public string abilityDescription;

        [Header("Flavour")]
        [TextArea(2, 4)]
        public string flavorText;
    }
}
