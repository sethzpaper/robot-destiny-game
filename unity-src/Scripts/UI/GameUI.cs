using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace SteelRobotDestiny
{
    // Wire all references in the Inspector.
    // This script listens to GameManager.onStateChanged and rebuilds UI.
    public class GameUI : MonoBehaviour
    {
        [Header("Manager")]
        public GameManager gm;

        [Header("Prefab")]
        public CardUI cardPrefab;

        [Header("Player Areas")]
        public Transform playerHandContainer;
        public Transform playerFieldContainer;
        public Transform aiHandContainer;
        public Transform aiFieldContainer;

        [Header("HUD")]
        public TextMeshProUGUI playerHpText;
        public TextMeshProUGUI playerEnergyText;
        public TextMeshProUGUI playerDeckText;
        public TextMeshProUGUI aiHpText;
        public TextMeshProUGUI aiEnergyText;
        public TextMeshProUGUI aiDeckText;
        public TextMeshProUGUI phaseText;
        public TextMeshProUGUI turnText;
        public TextMeshProUGUI messageText;

        [Header("Buttons")]
        public Button advanceBtn;
        public Button restartBtn;

        [Header("Log")]
        public Transform logContainer;
        public TextMeshProUGUI logEntryPrefab;

        [Header("Game Over Panel")]
        public GameObject gameOverPanel;
        public TextMeshProUGUI gameOverText;

        CardInstance _selectedHandCard;

        void Awake()
        {
            gm.onStateChanged.AddListener(Rebuild);
            gm.onGameOver.AddListener(OnGameOver);
            advanceBtn.onClick.AddListener(gm.AdvancePhase);
            restartBtn.onClick.AddListener(gm.StartGame);
        }

        void Rebuild()
        {
            BuildHand(playerHandContainer, gm.Player.Hand, OnPlayerHandCardClick, false);
            BuildField(playerFieldContainer, gm.Player.Field, OnPlayerFieldCardClick);
            BuildHand(aiHandContainer, gm.AI.Hand, null, true);
            BuildField(aiFieldContainer, gm.AI.Field, OnAiFieldCardClick);

            playerHpText.text   = $"❤ {gm.Player.Hp}/200";
            playerEnergyText.text = $"⚡ {gm.Player.Energy}/{gm.Player.MaxEnergy}";
            playerDeckText.text = $"📚 {gm.Player.Deck.Count}";
            aiHpText.text       = $"❤ {gm.AI.Hp}/200";
            aiEnergyText.text   = $"⚡ {gm.AI.MaxEnergy}";
            aiDeckText.text     = $"📚 {gm.AI.Deck.Count}";

            phaseText.text = gm.Phase.ToString();
            turnText.text  = $"Turn {gm.Turn}";

            bool playerTurn = gm.ActivePlayer == PlayerId.Player && gm.Winner == null;
            bool showAdvance = playerTurn && (gm.Phase == GamePhase.Main1 || gm.Phase == GamePhase.Order || gm.Phase == GamePhase.Main2);
            advanceBtn.gameObject.SetActive(showAdvance);
            advanceBtn.GetComponentInChildren<TextMeshProUGUI>().text = gm.Phase switch
            {
                GamePhase.Main1 => "Order Phase →",
                GamePhase.Order => gm.IsAttacker(null) ? "โจมตี!" : "ข้าม Battle →",
                GamePhase.Main2 => "จบเทิร์น →",
                _ => "ถัดไป →",
            };

            gameOverPanel.SetActive(gm.Winner.HasValue);
        }

        void BuildHand(Transform container, List<CardInstance> hand, System.Action<CardInstance> onClick, bool faceDown)
        {
            foreach (Transform child in container) Destroy(child.gameObject);
            foreach (var inst in hand)
            {
                var ui = Instantiate(cardPrefab, container);
                if (faceDown)
                {
                    ui.background.color = new Color(0.15f, 0.1f, 0.4f);
                    ui.nameText.text = "?";
                    ui.artworkImage.gameObject.SetActive(false);
                    ui.GetComponent<Button>().interactable = false;
                }
                else
                {
                    bool canPlay = gm.CanPlay(inst);
                    ui.Bind(inst, onClick);
                    ui.SetSelected(inst == _selectedHandCard);
                    ui.GetComponent<Button>().interactable = canPlay || inst == _selectedHandCard;
                }
            }
        }

        void BuildField(Transform container, List<CardInstance> field, System.Action<CardInstance> onClick)
        {
            foreach (Transform child in container) Destroy(child.gameObject);
            foreach (var inst in field)
            {
                var ui = Instantiate(cardPrefab, container);
                ui.Bind(inst, onClick);
                ui.SetAttacker(gm.IsAttacker(inst));
            }
        }

        void OnPlayerHandCardClick(CardInstance inst)
        {
            if (gm.ActivePlayer != PlayerId.Player || gm.Winner.HasValue) return;

            bool needsTarget = inst.Data.hasAbility && inst.Data.abilityId is
                "damage_unit_5" or "boost_atk_3" or "stat_atk_3" or "stat_def_3" or "stat_atk_2_def_2";

            if (needsTarget)
            {
                _selectedHandCard = inst;
                messageText.text = "เลือกเป้าหมาย";
            }
            else
            {
                _selectedHandCard = null;
                gm.PlayCard(inst);
            }
            Rebuild();
        }

        void OnPlayerFieldCardClick(CardInstance inst)
        {
            if (gm.ActivePlayer != PlayerId.Player || gm.Winner.HasValue) return;

            if (gm.Phase == GamePhase.Order)
            {
                gm.ToggleAttacker(inst);
                Rebuild();
                return;
            }

            if (_selectedHandCard != null)
            {
                // Friendly target
                gm.PlayCard(_selectedHandCard, inst);
                _selectedHandCard = null;
                Rebuild();
            }
        }

        void OnAiFieldCardClick(CardInstance inst)
        {
            if (_selectedHandCard == null) return;
            if (gm.ActivePlayer != PlayerId.Player || gm.Winner.HasValue) return;

            // Enemy target (e.g. damage_unit_5)
            gm.PlayCard(_selectedHandCard, inst);
            _selectedHandCard = null;
            Rebuild();
        }

        void OnGameOver(PlayerId winner)
        {
            gameOverText.text = winner == PlayerId.Player ? "🏆 ผู้เล่นชนะ!" : "💀 AI ชนะ!";
            gameOverPanel.SetActive(true);
        }

        // Called by GameManager.onLogAdded
        public void AddLogEntry(string msg)
        {
            var entry = Instantiate(logEntryPrefab, logContainer);
            entry.text = msg;
        }
    }
}
