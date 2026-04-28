using System.Collections.Generic;
using UnityEngine;

namespace SteelRobotDestiny
{
    public enum PlayerId { Player, AI }

    public class PlayerState
    {
        public PlayerId Id { get; }
        public string Name { get; }
        public int Hp { get; set; } = 200;
        public int Cores { get; set; }          // number of Core cards on field
        public int Energy { get; set; }
        public bool PlayedCoreThisTurn { get; set; }

        public List<CardInstance> Hand    = new();
        public List<CardInstance> Deck    = new();
        public List<CardInstance> Field   = new();  // max 5 units
        public List<CardInstance> Graveyard = new();

        public int MaxEnergy => Cores + 3;          // base 3 + each core

        public PlayerState(PlayerId id, string name, DeckDefinition deckDef)
        {
            Id = id;
            Name = name;
            var cards = deckDef.BuildDeck();
            Deck = CardInstance.Instantiate(Shuffle(cards));
            DrawCards(5);
        }

        public void DrawCard()
        {
            if (Deck.Count == 0) return;
            Hand.Add(Deck[0]);
            Deck.RemoveAt(0);
        }

        public void DrawCards(int n) { for (int i = 0; i < n; i++) DrawCard(); }

        public void RefreshForTurn()
        {
            Energy = MaxEnergy;
            PlayedCoreThisTurn = false;
            foreach (var u in Field) { u.IsTapped = false; u.HasSummoningSickness = false; u.AtkMod = 0; }
        }

        static List<CardData> Shuffle(List<CardData> deck)
        {
            var a = new List<CardData>(deck);
            for (int i = a.Count - 1; i > 0; i--)
            {
                int j = Random.Range(0, i + 1);
                (a[i], a[j]) = (a[j], a[i]);
            }
            return a;
        }
    }
}
