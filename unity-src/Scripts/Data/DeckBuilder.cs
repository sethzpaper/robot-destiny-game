using System.Collections.Generic;
using UnityEngine;

namespace SteelRobotDestiny
{
    // Assign card assets in Inspector, then call BuildStarterDeck()
    [CreateAssetMenu(fileName = "StarterDeck", menuName = "SRD/Deck Definition")]
    public class DeckDefinition : ScriptableObject
    {
        [System.Serializable]
        public struct DeckEntry
        {
            public CardData card;
            [Range(1, 3)] public int copies;
        }

        public List<DeckEntry> entries;

        public List<CardData> BuildDeck()
        {
            var deck = new List<CardData>();
            foreach (var e in entries)
                for (int i = 0; i < e.copies; i++)
                    deck.Add(e.card);
            return deck;
        }
    }
}
