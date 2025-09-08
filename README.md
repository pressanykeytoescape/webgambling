# Fun Casino

Fun Casino ist eine responsive Single‐Page‐Applikation basierend auf Angular 16. Die App bietet vier klassische Casinospiele – Lobby, Slots, Blackjack und Roulette – jedoch ohne echten Geldeinsatz. Der Spieler verfügt über ein virtuelles Konto, das aufgefüllt werden kann. Sämtliche Spielregeln und Zufallsereignisse sind clientseitig implementiert; ein Seedable RNG ermöglicht deterministische Tests.

## Einrichtung

1. **Abhängigkeiten installieren**

   ```bash
   npm ci
   ```

2. **Entwicklungsserver starten**

   ```bash
   npm run dev
   ```

   Die Anwendung ist anschließend unter `http://localhost:4200` erreichbar. Änderungen im Code werden automatisch durch den Angular CLI Development Server neu geladen.

3. **Production Build**

   ```bash
   npm run build
   ```

   Das Ergebnis findet sich im Ordner `dist/fun-casino`.

4. **Tests ausführen**

   ```bash
   # Unit‐Tests mit Jest
   npm test

   # End‐to‐End‐Tests mit Playwright
   npm run e2e
   ```

## Architektur

### Ordnerstruktur

- `src/app/core` – zentrale Logik wie State Management (NgRx) und Services
- `src/app/features/lobby` – Startbildschirm, Kontoübersicht, Navigation, Einzahlungs‑ und Einstellungsdialoge
- `src/app/features/slots` – Slotmaschine mit drei Walzen und fünf Gewinnlinien
- `src/app/features/blackjack` – Einfaches Blackjack gegen den Dealer
- `src/app/features/roulette` – Europäisches Roulette mit verschiedenen Wettoptionen
- `src/assets/config/payouts.json` – Konfigurierbare Auszahlungstabelle und Symbolset für Slots
- `src/styles.css` – globale TailwindCSS‑basierte Styles

### State Management

Die Anwendung verwendet **NgRx** für globales State Management. `GameState` verwaltet das Spieler‑Guthaben sowie Einstellungsoptionen (Ton und Animationen). Aktionen (Deposit, SlotsSpin, BlackjackDeal etc.) werden über `GameEffects` verarbeitet. Payouts und Animationen können asynchron via Effects gesteuert werden. Der Store persistiert seinen Zustand in `localStorage`, damit das Guthaben auch nach einem Neuladen erhalten bleibt.

### Zufallszahlen und Testbarkeit

Für alle Spiele wird ein eigener **`RngService`** verwendet, der über eine simple Mulberry32 Implementierung verfügt. Die interne Seed‑Variable kann gesetzt werden, um deterministische Abfolgen zu erzeugen – hilfreich für Unit‑ und E2E‑Tests. Es findet keine Interaktion mit externen Zufallsquellen statt, wodurch die Anwendung vollständig offline funktioniert.

### Styling und Animationen

TailwindCSS ist als Utility‑First‑Framework eingebunden. Das erlaubt ein schnelles und konsistentes Styling ohne große CSS‐Dateien. Für Slot‑Walzen und andere visuelle Effekte werden einfache CSS‑Transitions verwendet; GSAP könnte bei Bedarf eingebunden werden und lässt sich über die Einstellungen deaktivieren. Alle Komponenten sind responsiv und mobil‑first gestaltet.

### Spielen der Features

- **Lobby:** Zeigt das aktuelle Guthaben. Über Buttons gelangt man zu den Spielen oder füllt das Guthaben mit einem Klick auf "Einzahlen" wieder auf. In den Einstellungen lassen sich Ton und Animationen global an‑ oder ausschalten.
- **Slots:** Drei Walzen mit fünf Gewinnlinien. Der Einsatz kann zwischen 1 und 100 festgelegt werden. Nach dem Betätigen des Spin‑Buttons wird der Einsatz sofort vom Guthaben abgezogen und nach einer kurzen Animation das Ergebnis angezeigt. Die Auszahlungstabelle ist über `src/assets/config/payouts.json` anpassbar.
- **Blackjack:** Spiel gegen einen virtuellen Dealer. Der Einsatz wird beim Ausgeben der Karten abgezogen. "Hit" fügt dem Spieler weitere Karten hinzu, "Stand" lässt den Dealer ziehen. Blackjacks zahlen das 3:2‑fache des Einsatzes, ein Push erstattet den Einsatz. Busts führen zum Verlust des Einsatzes.
- **Roulette:** Europäisches Layout mit den Zahlen 0–36. Als Wettarten stehen Zahl (0–36), Farbe (Rot/Schwarz), Gerade/Ungerade sowie Dutzendwetten zur Auswahl. Gewinne werden je nach Quote ausgezahlt (z. B. 36:1 für die korrekte Zahl, 2:1 für Farbe und Gerade/Ungerade).

## Designentscheidungen

1. **NgRx**: Für das zentrale State Management wurde NgRx gewählt, da es eine etablierte und skalierbare Lösung für komplexere Angular‐Apps bietet. Mit Actions, Reducern und Effects lassen sich Spielabläufe sauber trennen und testen. Außerdem ermöglicht der Devtools‑Support ein einfaches Debugging.
2. **TailwindCSS**: Durch den Utility‑Ansatz von Tailwind bleibt der Komponenten‐Code übersichtlich und es entstehen keine unerwarteten Stilkonflikte. Die Konfiguration ist minimal und lässt sich bei Bedarf erweitern. Sollten Entwickler andere SCSS‑Utilities bevorzugen, kann `src/styles.css` auf SCSS umgestellt werden.
3. **GSAP Fallback**: Animationen sind bewusst simpel gehalten und über die Einstellungen deaktivierbar. Würde GSAP eingesetzt, könnten komplexere Animationen wie Motion Blur und Easing‐Kurven realisiert werden. Durch die Abstraktion in der Komponente kann dies später ergänzt werden.
4. **Seedable RNG**: Ein eigener Random Number Generator ermöglicht reproduzierbare Spielabläufe. In den Unit Tests wird er mit festen Seeds initialisiert, sodass erwartete Gewinnmuster und Payouts überprüft werden können.

## Anpassungen

### Auszahlungen anpassen

Die Auszahlungstabelle und das Symbolset für die Slotmaschine befinden sich in `src/assets/config/payouts.json`. Um neue Symbole hinzuzufügen oder Werte zu ändern, kann die Datei wie folgt angepasst werden:

```json
{
  "symbols": ["🍒", "🔔", "7", "🍋", "⭐", "🍀"],
  "payouts": {
    "🍒": { "3": 5 },
    "🔔": { "3": 10 },
    "7": { "3": 20 },
    "🍋": { "3": 3 },
    "⭐": { "3": 15 },
    "🍀": { "3": 50 }
  }
}
```

Die SlotsService liest dieses JSON beim Start ein. Gewinnlinien sind auf Dreier‐Kombinationen beschränkt; wer weitere Linien oder Multiplikatoren wünscht, kann den Service entsprechend erweitern.

### RNG oder Wahrscheinlichkeiten ändern

Die Randomness ist in `RngService` implementiert. Um die Verteilung der Symbole in der Slotmaschine zu beeinflussen, können Sie das Symbolset im Payout‑Config anpassen oder in `SlotsService.spin()` die Gewichtung variieren (z. B. häufiger erscheint 🍒, seltener ⭐). Für Blackjack oder Roulette entsprechen die Zufallszahlen dem echten Karten‑ bzw. Zahlenraum; Anpassungen sollten entsprechend dem gewünschten Schwierigkeitsgrad vorgenommen werden.

## Weiterentwicklung

Die aktuelle Implementierung bildet die Kernmechanik der Spiele ab. Mögliche Erweiterungen:

- **Animationsverbesserung:** Integration von GSAP für flüssigere Walzen‑, Karten- und Roulette‑Animationen.
- **Soundeffekte:** Einbinden von Audio‑Feedback bei Gewinn oder Verlust, steuerbar über die Einstellungen.
- **Mehrspielermodus:** Aktive Spiele könnten im Lobby gelistet und von anderen Spielern gejoint werden (nur als Frontend‑Simulation ohne Server).
- **Komplexere Blackjack‑Optionen:** Implementierung von Split und Insurance sowie Konfiguration des Dealer‑Verhaltens (z. B. Hit on soft 17).
- **Umfangreichere Tests:** Erweiterung der E2E‑Tests, um alle Spielverläufe und Randfälle abzudecken.

Viel Spaß beim Spielen und Entwickeln!