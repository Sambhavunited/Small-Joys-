import { bestsellers, products, type Product } from "@/data/menu";
import { site } from "@/data/site";
import { priceCart, type CartLine } from "@/lib/cart";
import { formatINR } from "@/lib/format";

// A simple rule-based assistant used when the AI is unavailable
// (no API key yet, or the AI service is down). It still recommends
// products and hands orders to WhatsApp, so the chat never dead-ends.

type GuidedReply = { text: string; productIds?: string[]; handoff?: boolean; suggestions: string[] };

const ids = (...list: string[]) => list.filter((id) => products.some((p) => p.id === id));

const defaultSuggestions = ["Show bestsellers", "Gift ideas under ₹500", "Custom cake", "Corporate gifting"];

function byBudget(max: number) {
  return products
    .filter(
      (p): p is Product & { price: number } =>
        p.price != null && !p.madeToOrder && p.price <= max && p.price >= Math.min(150, max),
    )
    .sort((a, b) => b.price - a.price)
    .slice(0, 4)
    .map((p) => p.id);
}

function nameMatches(text: string) {
  const t = text.toLowerCase();
  const words: [RegExp, string[]][] = [
    [/brownie/, ["brownies-box-6", "brownie-tub", "printed-brownies"]],
    [/cookie|biscuit/, ["cookie-tin", "printed-cookies", "cookie-cup"]],
    [/cupcake/, ["cupcakes-box-6", "cupcakes-box-12-mini"]],
    [/macaron|macron/, ["macarons-box-6"]],
    [/donut|doughnut/, ["donuts-box-6"]],
    [/tiramisu/, ["tiramisu-tub"]],
    [/loaf|dry cake|tea cake/, ["loaf-cake", "dry-cake-hamper", "tea-cake"]],
    [/hamper|basket|gift box/, ["dry-cake-hamper", "assorted-hamper", "gift-basket"]],
    [/jar/, ["jar-cake"]],
    [/pastr/, ["pastry"]],
    [/chocolate bar|wrapper/, ["custom-chocolate-bars"]],
    [/catering|high.?tea|breakfast|brunch|kitty/, ["catering-high-tea"]],
  ];
  for (const [re, list] of words) if (re.test(t)) return ids(...list);
  return [];
}

export function guidedReply(message: string, cart: CartLine[], opts: { notedContact?: boolean } = {}): GuidedReply {
  const t = message.toLowerCase();
  const priced = priceCart(cart);
  const hasBox = priced.lines.length > 0;
  const boxSuggestion = hasBox ? ["Send my order on WhatsApp"] : [];

  if (/(send|place|confirm).*(order|whatsapp)|checkout|ready to order|^order$/.test(t)) {
    if (!hasBox) {
      return {
        text: "Your gift box is empty right now. Tell me what you're celebrating, or tap a suggestion and I'll show you some favourites.",
        productIds: bestsellers.slice(0, 4).map((p) => p.id),
        suggestions: defaultSuggestions,
      };
    }
    return {
      text: `Lovely! Your gift box comes to about ${formatINR(priced.subtotal)}${priced.hasUnpriced ? " plus items priced on WhatsApp" : ""}. Tap the green button to send it to ${site.owner} on WhatsApp to confirm the final price, delivery and payment. For a smoother order you can also fill in your details at checkout.`,
      handoff: true,
      suggestions: ["Go to checkout", "Add something else"],
    };
  }

  if (!opts.notedContact && /whatsapp|call|talk|human|person|deepika|contact|phone number/.test(t)) {
    return {
      text: `You can message ${site.owner} directly on WhatsApp at ${site.phoneDisplay}. Tap the green button and your gift box (if any) will be typed out in the message.`,
      handoff: true,
      suggestions: ["Show bestsellers", "Custom cake"],
    };
  }

  const budget = t.match(/(?:under|below|within|budget|upto|up to|₹|rs\.?|inr)\s*₹?\s*(\d{2,6})/);
  if (budget) {
    const max = Number(budget[1]);
    const list = byBudget(max);
    if (list.length) {
      return {
        text: `Here are some lovely picks within ${formatINR(max)}. Tap Add on anything you like and it goes into your gift box.`,
        productIds: list,
        suggestions: [...boxSuggestion, "Festive gifts", "Corporate gifting"],
      };
    }
  }

  if (/custom|theme|design|tier|fondant|birthday cake|anniversary cake|photo cake/.test(t)) {
    return {
      text: `${site.owner} designs custom celebration cakes around your story, from elegant buttercream finishes to fun theme cakes. Share the theme, number of guests, flavour and date on WhatsApp to get a quote.`,
      productIds: ids("custom-cake"),
      handoff: true,
      suggestions: ["Show bestsellers", "Kids' party ideas"],
    };
  }
  if (/corporate|office|client|team|bulk|employee|company|logo/.test(t)) {
    return {
      text: "For corporate gifting, printed cookies and brownies can carry your logo or message, and our bag hampers and personalised chocolate bars are popular with teams. Share the quantity, budget and date on WhatsApp for a quote.",
      productIds: ids("printed-cookies", "printed-brownies", "bag-hamper", "custom-chocolate-bars"),
      suggestions: [...boxSuggestion, "Gift ideas under ₹500", "Talk on WhatsApp"],
    };
  }
  if (/diwali|festive|festival|rakhi|raksha|bhai|sibling|dooj|christmas|new year|eid|holi/.test(t)) {
    return {
      text: "Our festive favourites are the Dry Cake Hamper, the Mini Treats box, the Cookie Tin and The Sibling Edit DIY Cookie Kit. All come gift-ready.",
      productIds: ids("dry-cake-hamper", "mini-treats-6", "cookie-tin", "diy-cookie-kit"),
      suggestions: [...boxSuggestion, "Gift ideas under ₹500", "Corporate gifting"],
    };
  }
  if (/kid|child|party|son|daughter|school|return gift/.test(t)) {
    return {
      text: "For kids, the DIY Cookie Kit is a hit, and cake pops, mini cupcakes and cake sickles are perfect for parties and return gifts.",
      productIds: ids("diy-cookie-kit", "cake-pops-hamper", "cupcakes-box-12-mini", "cake-sickles"),
      suggestions: [...boxSuggestion, "Custom cake", "Talk on WhatsApp"],
    };
  }
  if (/wedding|favour|favor|dessert table|event|guests|engagement|baby shower/.test(t)) {
    return {
      text: "For events we make bite-sized dessert table pieces priced per piece, plus favour boxes. Share your guest count and date on WhatsApp for a full quote.",
      productIds: ids("dt-macarons", "dt-shot-glasses", "dt-cheesecake", "mini-treats-4"),
      suggestions: [...boxSuggestion, "Talk on WhatsApp", "Show bestsellers"],
    };
  }
  if (/thank|teacher|neighbou?r|small gift|hostess/.test(t)) {
    return {
      text: "Sweet thank-you gifts that always land well:",
      productIds: ids("mini-treats-4", "cookie-cup", "macarons-box-6", "loaf-cake"),
      suggestions: [...boxSuggestion, "Gift ideas under ₹500"],
    };
  }

  const named = nameMatches(t);
  if (named.length) {
    return {
      text: "Here you go. Tap Add to put anything in your gift box.",
      productIds: named,
      suggestions: [...boxSuggestion, "Show bestsellers", "Talk on WhatsApp"],
    };
  }

  if (/bestseller|popular|recommend|suggest|favourite|favorite|menu|what do you have/.test(t)) {
    return {
      text: "These are our most-loved treats right now:",
      productIds: bestsellers.slice(0, 6).map((p) => p.id),
      suggestions: [...boxSuggestion, "Festive gifts", "Custom cake"],
    };
  }

  if (opts.notedContact) {
    return hasBox
      ? {
          text: `Whenever you're ready, tap "Send my order on WhatsApp" and your gift box goes to ${site.owner} with everything typed out.`,
          suggestions: ["Send my order on WhatsApp", "Add something else", "Go to checkout"],
        }
      : {
          text: "What are you celebrating? Tell me the occasion, your budget or what you're craving, and I'll suggest something lovely.",
          productIds: bestsellers.slice(0, 4).map((p) => p.id),
          suggestions: defaultSuggestions,
        };
  }

  return {
    text: `Hi! I'm ${site.assistantName}, the ${site.name} gifting assistant. Tell me what you're celebrating, your budget, or what you're craving, and I'll suggest something lovely. You can also message ${site.owner} on WhatsApp anytime.`,
    productIds: bestsellers.slice(0, 4).map((p) => p.id),
    suggestions: [...boxSuggestion, ...defaultSuggestions].slice(0, 4),
  };
}
