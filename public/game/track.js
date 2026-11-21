// Count game events on GoatCounter (petripals.goatcounter.com, shared with
// PetriPals), alongside the page visits its script counts on its own. Each
// event shows up on the dashboard like a page, under "homebody-hollow/" so
// it's apart from PetriPals' own, e.g. "homebody-hollow/moved-in/teacup".
// No cookies and nothing personal is sent. If the script didn't load (an ad
// blocker, or playing offline), this quietly does nothing; GoatCounter also
// skips localhost, so playing locally isn't counted.
export function track(name, title = name) {
  try {
    window.goatcounter?.count?.({ path: `homebody-hollow/${name}`, title, event: true });
  } catch {
    // Counting is never worth breaking the game over.
  }
}
