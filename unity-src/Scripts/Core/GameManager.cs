using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace SteelRobotDestiny
{
    public enum GamePhase { Draw, Main1, Order, Battle, Main2, End, GameOver }

    public class GameManager : MonoBehaviour
    {
        [Header("Setup")]
        public DeckDefinition playerDeck;
        public DeckDefinition aiDeck;

        [Header("Events — wire up in Inspector")]
        public UnityEvent onStateChanged;
        public UnityEvent<string> onLogAdded;
        public UnityEvent<PlayerId> onGameOver;

        // ── State ──────────────────────────────────────────────────────────────
        public PlayerState Player { get; private set; }
        public PlayerState AI { get; private set; }
        public GamePhase Phase { get; private set; }
        public int Turn { get; private set; } = 1;
        public PlayerId ActivePlayer { get; private set; } = PlayerId.Player;
        public bool IsProcessing { get; private set; }
        public PlayerId? Winner { get; private set; }

        public List<string> Log { get; } = new();

        // ── Unity lifecycle ────────────────────────────────────────────────────
        void Start() => StartGame();

        public void StartGame()
        {
            Player = new PlayerState(PlayerId.Player, "ผู้เล่น", playerDeck);
            AI     = new PlayerState(PlayerId.AI,     "AI",     aiDeck);
            Turn   = 1;
            Winner = null;
            ActivePlayer = PlayerId.Player;
            Log.Clear();
            AddLog("[ เกมเริ่มต้น! ]");
            BeginTurn();
        }

        // ── Turn flow ──────────────────────────────────────────────────────────
        void BeginTurn()
        {
            var p = GetActive();
            p.RefreshForTurn();
            p.DrawCard();
            AddLog($"--- เทิร์นที่ {Turn}: {p.Name} ---");
            Phase = GamePhase.Main1;
            Notify();

            if (ActivePlayer == PlayerId.AI)
                StartCoroutine(RunAiTurn());
        }

        public void AdvancePhase()
        {
            if (IsProcessing || Winner != null) return;

            switch (Phase)
            {
                case GamePhase.Main1:
                    Phase = GamePhase.Order;
                    Notify();
                    break;

                case GamePhase.Order:
                    if (_declaredAttackers.Count > 0)
                    {
                        Phase = GamePhase.Battle;
                        Notify();
                        StartCoroutine(ResolveBattle());
                    }
                    else
                    {
                        Phase = GamePhase.Main2;
                        Notify();
                    }
                    break;

                case GamePhase.Main2:
                    EndTurn();
                    break;
            }
        }

        void EndTurn()
        {
            _declaredAttackers.Clear();
            ActivePlayer = ActivePlayer == PlayerId.Player ? PlayerId.AI : PlayerId.Player;
            if (ActivePlayer == PlayerId.Player) Turn++;
            BeginTurn();
        }

        // ── Card play ──────────────────────────────────────────────────────────
        public bool CanPlay(CardInstance inst)
        {
            var p = GetActive();
            if (Winner != null || IsProcessing) return false;
            if (Phase != GamePhase.Main1 && Phase != GamePhase.Main2) return false;
            if (p.Energy < inst.Data.cost) return false;
            if (inst.Data.cardType == CardType.Unit && p.Field.Count >= 5) return false;
            if (inst.Data.cardType == CardType.Core && p.PlayedCoreThisTurn) return false;
            return true;
        }

        public void PlayCard(CardInstance inst, CardInstance target = null)
        {
            var p = GetActive();
            var opp = GetOpponent();
            if (!CanPlay(inst)) return;

            p.Hand.Remove(inst);
            p.Energy -= inst.Data.cost;

            AddLog($"{p.Name} เล่น [{inst.Data.cardName}]");

            switch (inst.Data.cardType)
            {
                case CardType.Unit:
                    if (inst.Data.hasAbility && inst.Data.abilityId == "haste")
                        inst.HasSummoningSickness = false;
                    p.Field.Add(inst);
                    if (inst.Data.hasAbility && inst.Data.abilityTrigger == EffectTrigger.OnPlay)
                        CardEffectResolver.Resolve(inst.Data.abilityId, this, p, opp, target);
                    break;

                case CardType.Program:
                    p.Graveyard.Add(inst);
                    CardEffectResolver.Resolve(inst.Data.abilityId, this, p, opp, target);
                    break;

                case CardType.Upgrade:
                    if (target == null || !p.Field.Contains(target)) return;
                    p.Graveyard.Add(inst);
                    CardEffectResolver.Resolve(inst.Data.abilityId, this, p, opp, target);
                    break;

                case CardType.Core:
                    p.Graveyard.Add(inst);
                    p.PlayedCoreThisTurn = true;
                    CardEffectResolver.Resolve("add_core", this, p, opp);
                    break;
            }

            Notify();
        }

        // ── Combat ────────────────────────────────────────────────────────────
        readonly List<CardInstance> _declaredAttackers = new();

        public void ToggleAttacker(CardInstance unit)
        {
            if (Phase != GamePhase.Order || ActivePlayer != PlayerId.Player) return;
            if (unit.IsTapped || unit.HasSummoningSickness) return;
            if (_declaredAttackers.Contains(unit)) _declaredAttackers.Remove(unit);
            else _declaredAttackers.Add(unit);
            Notify();
        }

        public bool IsAttacker(CardInstance unit) => _declaredAttackers.Contains(unit);

        IEnumerator ResolveBattle()
        {
            IsProcessing = true;
            var attacker = GetActive();
            var defender = GetOpponent();

            foreach (var att in new List<CardInstance>(_declaredAttackers))
            {
                if (!attacker.Field.Contains(att)) continue;

                if (defender.Field.Count == 0)
                {
                    int dmg = att.EffectiveAtk;
                    defender.Hp = Mathf.Max(0, defender.Hp - dmg);
                    AddLog($"{att.Data.cardName} โจมตีตรง → {defender.Name} เสีย {dmg} HP! ({defender.Hp} HP)");
                    att.IsTapped = true;
                    if (defender.Hp <= 0) { DeclareWinner(attacker.Id); break; }
                }
                else
                {
                    // Attack weakest defender
                    var def = WeakestUnit(defender.Field);
                    int atkDmg = att.EffectiveAtk;
                    int ctrDmg = def.EffectiveAtk;

                    att.CurrentHp -= ctrDmg;
                    def.CurrentHp -= atkDmg;
                    att.IsTapped = true;

                    AddLog($"{att.Data.cardName} [{atkDmg}] ⚔ {def.Data.cardName} [{ctrDmg}]");

                    if (att.CurrentHp <= 0) { attacker.Field.Remove(att); attacker.Graveyard.Add(att); AddLog($"{att.Data.cardName} ถูกทำลาย!"); }
                    if (def.CurrentHp <= 0) { defender.Field.Remove(def); defender.Graveyard.Add(def); AddLog($"{def.Data.cardName} ถูกทำลาย!"); }
                }

                Notify();
                yield return new WaitForSeconds(0.5f);
            }

            _declaredAttackers.Clear();
            IsProcessing = false;

            if (Winner == null)
            {
                Phase = GamePhase.Main2;
                Notify();
            }
        }

        static CardInstance WeakestUnit(List<CardInstance> field)
        {
            CardInstance weakest = field[0];
            foreach (var u in field) if (u.CurrentHp < weakest.CurrentHp) weakest = u;
            return weakest;
        }

        // ── AI ────────────────────────────────────────────────────────────────
        IEnumerator RunAiTurn()
        {
            IsProcessing = true;
            yield return new WaitForSeconds(0.6f);

            var ai = AI;
            var player = Player;

            // Play core
            var core = ai.Hand.Find(c => c.Data.cardType == CardType.Core && !ai.PlayedCoreThisTurn);
            if (core != null && CanPlay(core)) { PlayCard(core); yield return new WaitForSeconds(0.4f); }

            // Play units (highest cost first)
            var units = new List<CardInstance>(ai.Hand.FindAll(c => c.Data.cardType == CardType.Unit));
            units.Sort((a, b) => b.Data.cost - a.Data.cost);
            foreach (var u in units)
            {
                if (CanPlay(u)) { PlayCard(u); yield return new WaitForSeconds(0.4f); }
            }

            // Play programs
            foreach (var pg in new List<CardInstance>(ai.Hand.FindAll(c => c.Data.cardType == CardType.Program)))
            {
                if (!CanPlay(pg)) continue;
                string eid = pg.Data.abilityId;
                if (eid == "damage_unit_5" && player.Field.Count > 0)
                {
                    PlayCard(pg, WeakestUnit(player.Field));
                }
                else if (eid != "damage_unit_5" && eid != "boost_atk_3")
                {
                    PlayCard(pg);
                }
                yield return new WaitForSeconds(0.4f);
            }

            // Order phase: declare all valid attackers
            Phase = GamePhase.Order;
            foreach (var u in ai.Field)
                if (!u.IsTapped && !u.HasSummoningSickness) _declaredAttackers.Add(u);

            Notify();
            yield return new WaitForSeconds(0.6f);

            if (_declaredAttackers.Count > 0)
            {
                Phase = GamePhase.Battle;
                IsProcessing = false;
                yield return StartCoroutine(ResolveBattle());
            }
            else
            {
                _declaredAttackers.Clear();
            }

            IsProcessing = false;
            if (Winner == null) EndTurn();
        }

        // ── Helpers ────────────────────────────────────────────────────────────
        public PlayerState GetActive()   => ActivePlayer == PlayerId.Player ? Player : AI;
        public PlayerState GetOpponent() => ActivePlayer == PlayerId.Player ? AI : Player;

        public void DeclareWinner(PlayerId winner)
        {
            Winner = winner;
            Phase = GamePhase.GameOver;
            AddLog($"=== {(winner == PlayerId.Player ? "ผู้เล่นชนะ!" : "AI ชนะ!")} ===");
            onGameOver?.Invoke(winner);
            Notify();
        }

        public void AddLog(string msg)
        {
            Log.Insert(0, msg);
            if (Log.Count > 60) Log.RemoveAt(Log.Count - 1);
            onLogAdded?.Invoke(msg);
        }

        void Notify() => onStateChanged?.Invoke();
    }
}
