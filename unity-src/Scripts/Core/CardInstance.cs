using System.Collections.Generic;
using UnityEngine;

namespace SteelRobotDestiny
{
    public class CardInstance
    {
        static int _counter;
        public int InstanceId { get; } = ++_counter;
        public CardData Data { get; }

        public int CurrentHp { get; set; }
        public int AtkMod { get; set; }
        public int DefMod { get; set; }
        public bool IsTapped { get; set; }
        public bool HasSummoningSickness { get; set; } = true;

        public int EffectiveAtk => Data.atk + AtkMod;
        public int EffectiveDef => Data.def + DefMod;

        public CardInstance(CardData data)
        {
            Data = data;
            CurrentHp = data.def;
        }

        public static List<CardInstance> Instantiate(List<CardData> cards)
        {
            var list = new List<CardInstance>();
            foreach (var c in cards) list.Add(new CardInstance(c));
            return list;
        }
    }
}
