using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace SteelRobotDestiny
{
    // Attach to a Card prefab. Prefab structure:
    // CardUI (Image - card background)
    //   ├─ ArtworkImage (Image)
    //   ├─ TarotRomanText (TextMeshProUGUI)
    //   ├─ CostText (TextMeshProUGUI)
    //   ├─ NameText (TextMeshProUGUI)
    //   ├─ ThaiNameText (TextMeshProUGUI)
    //   ├─ TypeBadge (Image)
    //   │   └─ TypeText (TextMeshProUGUI)
    //   ├─ StatsRow (only visible for Unit type)
    //   │   ├─ AtkText (TextMeshProUGUI)
    //   │   └─ HpText (TextMeshProUGUI)
    //   ├─ AbilityText (TextMeshProUGUI)
    //   └─ SelectionGlow (Image, initially hidden)

    [RequireComponent(typeof(Button))]
    public class CardUI : MonoBehaviour
    {
        [Header("UI References")]
        public Image background;
        public Image artworkImage;
        public TextMeshProUGUI tarotRomanText;
        public TextMeshProUGUI costText;
        public TextMeshProUGUI nameText;
        public TextMeshProUGUI thaiNameText;
        public Image typeBadge;
        public TextMeshProUGUI typeText;
        public GameObject statsRow;
        public TextMeshProUGUI atkText;
        public TextMeshProUGUI hpText;
        public TextMeshProUGUI abilityText;
        public Image selectionGlow;
        public Image tappedOverlay;

        [Header("Type Badge Colors")]
        public Color unitColor   = new Color(0.2f, 0.4f, 0.9f);
        public Color programColor = new Color(0.9f, 0.2f, 0.2f);
        public Color upgradeColor = new Color(0.9f, 0.7f, 0.1f);
        public Color coreColor   = new Color(0.2f, 0.8f, 0.3f);

        CardInstance _instance;
        System.Action<CardInstance> _onClick;

        public void Bind(CardInstance inst, System.Action<CardInstance> onClick)
        {
            _instance = inst;
            _onClick  = onClick;
            Refresh();
            GetComponent<Button>().onClick.RemoveAllListeners();
            GetComponent<Button>().onClick.AddListener(() => _onClick?.Invoke(_instance));
        }

        public void Refresh()
        {
            if (_instance == null) return;
            var d = _instance.Data;

            costText.text      = $"⚡{d.cost}";
            tarotRomanText.text = d.tarotRoman;
            nameText.text      = d.cardName;
            thaiNameText.text  = d.thaiName;

            if (artworkImage != null && d.artwork != null)
                artworkImage.sprite = d.artwork;

            // Type badge
            typeText.text = d.cardType.ToString().ToUpper();
            typeBadge.color = d.cardType switch
            {
                CardType.Unit    => unitColor,
                CardType.Program => programColor,
                CardType.Upgrade => upgradeColor,
                CardType.Core    => coreColor,
                _                => Color.gray,
            };

            // Stats
            bool isUnit = d.cardType == CardType.Unit;
            if (statsRow != null) statsRow.SetActive(isUnit);
            if (isUnit)
            {
                atkText.text = $"⚔{_instance.EffectiveAtk}";
                hpText.text  = $"❤{_instance.CurrentHp}";
                hpText.color = _instance.CurrentHp <= 1 ? Color.red : Color.white;
            }

            // Ability
            if (abilityText != null)
                abilityText.text = d.hasAbility ? d.abilityDescription : string.Empty;

            // Background tint by faction
            if (background != null) background.color = d.factionColor;

            // Tapped overlay
            if (tappedOverlay != null) tappedOverlay.gameObject.SetActive(_instance.IsTapped);
        }

        public void SetSelected(bool selected)
        {
            if (selectionGlow != null) selectionGlow.gameObject.SetActive(selected);
        }

        public void SetAttacker(bool isAttacker)
        {
            if (selectionGlow != null)
            {
                selectionGlow.gameObject.SetActive(isAttacker);
                selectionGlow.color = isAttacker ? new Color(1f, 0.2f, 0.2f, 0.8f) : new Color(1f, 0.9f, 0f, 0.8f);
            }
        }
    }
}
