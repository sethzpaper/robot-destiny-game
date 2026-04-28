using UnityEngine;

namespace SteelRobotDestiny
{
    // Handles all card ability effects. Called by GameManager.
    public static class CardEffectResolver
    {
        public static void Resolve(string effectId, GameManager gm, PlayerState caster, PlayerState opponent, CardInstance target = null)
        {
            switch (effectId)
            {
                case "draw1":
                    caster.DrawCard();
                    gm.AddLog($"{caster.Name} จั่วไพ่ 1 ใบ");
                    break;

                case "draw2":
                    caster.DrawCards(2);
                    gm.AddLog($"{caster.Name} จั่วไพ่ 2 ใบ");
                    break;

                case "haste":
                    // Applied at summon time — unit has no summoning sickness
                    break;

                case "heal15":
                    caster.Hp = Mathf.Min(200, caster.Hp + 15);
                    gm.AddLog($"{caster.Name} ฟื้นฟู 15 HP ({caster.Hp}/200)");
                    break;

                case "heal_self_20":
                    caster.Hp = Mathf.Min(200, caster.Hp + 20);
                    gm.AddLog($"{caster.Name} ฟื้นฟู 20 HP ({caster.Hp}/200)");
                    break;

                case "damage_player_15":
                    opponent.Hp = Mathf.Max(0, opponent.Hp - 15);
                    gm.AddLog($"Data Surge → {opponent.Name} เสีย 15 HP! ({opponent.Hp} HP)");
                    if (opponent.Hp <= 0) gm.DeclareWinner(caster.Id);
                    break;

                case "damage_unit_5":
                    if (target == null) break;
                    target.CurrentHp -= 5;
                    gm.AddLog($"System Crash → {target.Data.cardName} เสีย 5 HP");
                    if (target.CurrentHp <= 0)
                    {
                        opponent.Field.Remove(target);
                        opponent.Graveyard.Add(target);
                        gm.AddLog($"{target.Data.cardName} ถูกทำลาย!");
                    }
                    break;

                case "boost_atk_3":
                    if (target == null) break;
                    target.AtkMod += 3;
                    gm.AddLog($"{target.Data.cardName} ได้ +3 ATK ในเทิร์นนี้");
                    break;

                case "stat_atk_3":
                    if (target != null) { target.AtkMod += 3; gm.AddLog($"+3 ATK"); }
                    break;

                case "stat_def_3":
                    if (target != null) { target.DefMod += 3; target.CurrentHp += 3; gm.AddLog($"+3 DEF"); }
                    break;

                case "stat_atk_2_def_2":
                    if (target != null) { target.AtkMod += 2; target.DefMod += 2; target.CurrentHp += 2; gm.AddLog($"+2 ATK / +2 DEF"); }
                    break;

                case "add_core":
                    caster.Cores++;
                    caster.Energy++;
                    gm.AddLog($"{caster.Name} วาง Core — พลังงานสูงสุด {caster.MaxEnergy}");
                    break;

                default:
                    Debug.LogWarning($"[SRD] Unknown effectId: {effectId}");
                    break;
            }
        }
    }
}
