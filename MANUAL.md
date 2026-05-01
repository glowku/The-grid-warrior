# GRID WARRIOR - MANUAL OPÉRATIONNEL COMPLET

Bienvenue dans le `GRID WARRIOR`. Ce document recense l'intégralité des commandes, fonctions, et pouvoirs mis à votre disposition en tant qu'utilisateur (`USER_SPACE`).

## COMMANDES DE BASE

- **Flèches directionnelles** : Permettent de se déplacer dans la grille.
- **Ecriture & Buffer** : Appuyez sur n'importe quelle touche clavier alphanumérique pour commencer à écrire dans le buffer.
- **Entrée (`[ENTER]`)** : Exécute le code actuellement contenu dans votre buffer.
- **Retour Arrière (`[BACKSPACE]`)** : Efface le dernier caractère et recule votre curseur.
- **Molette Souris (`Scroll`)** : Modifie le zoom de la caméra (caméra dynamique).
- **Macros (`F1` à `F12`)** : Coller et exécuter immédiatement les codes gardés en mémoire. Les slots se débloquent avec vos niveaux d'XP.
- **Capture Logique (`CTRL+C`)** : Si votre curseur est sur une cellule ennemie, copie le code de la cellule adverse (char/couleur).
- **Injection Logique (`CTRL+V`)** : Pousse le code copié sur votre position actuelle, ce qui le convertit sous votre contrôle.

## 1. RÈGLES DE SURVIE ET INTÉGRITÉ (LE CŒUR DU JEU)

- **Votre Integrité** : Vous possédez 100 points d'intégrité (Health Points). Si elle tombe à 0, c'est le Game Over (System Crash).
- **Ennemis** : Diverses factions IA (représentées par des langages de programmation ex: Rust, Python) s'étendent sur toute la carte et infectent les objets sur leur passage.
- **Mouvement mortel** : Toucher une IA ou ses projectiles sans `shield` ou sans `glitch_mode` vous fera subir des dégâts.
- **Soins** : Si votre curseur **reste immobile** sur une case blanche vide appartenant à l'utilisateur, un processus de récupération de l'Intégrité (+1/sec) débute (Heal Protocol).
- **Niveaux & XP** : Éliminer des ennemis avec des projectiles (creer une collision `null` -> IA) vous donnera de l'XP. Monter en niveau débloque de nouvelles fonctions, votre super curseur et enrichit votre monde (plus de Boss à des niveaux élevés).

## 2. EXÉCUTION DYNAMIQUE "THE LIFE-CODE" (FONCTIONS BUILT-IN)

Le moteur de jeu interprète vos saisies pour agir sur le monde. Frappez une commande puis `[ENTER]`.

### Entités et Objets (Typage Physique)
- `spawn(Guardian, {shape: 'shield', scale: 2})` : Alterne autour de vous des boucliers protecteurs physiques.
- `spawn(Drone, {shape: 'pulse'})` : Gère une zone pulsée repoussant visuellement et fonctionnellement l'ennemi. (La forme "matrix" etc. fonctionne).
- `function f() {}` ou `fn run_rust(...)` : Fait spawne un `SUPER_OBJ`. Un objet semi-structuré massif qui défend la zone en tant que bloc physique (le Rust est par nature agressif).

### Arts Complexes & Dessins Animés (NEW)
Créez des structures complexes et graphiques directement sur le port !
- `svg(dragon)` : Engendre le dessin animé très complexe d'un dragon traçant son chemin dans la grille.
- `svg(gear)` : Dessine un engrenage de code tournant perpétuellement.
- `<svg>...<path d="M..."/></svg>` : Le parseur lira directement n'importe quel tag HTML/SVG que vous lui injectez et l'invoquera en animation par-dessus la grille.

### Animations et CSS (Styles Dynamiques)
Injectez des styles pour altérer localement la physique des particules de 1D à 3D !
- `color: <nom_ou_hex>` (ex: `color: red;`) : Remplace les textures autour de vous avec cette couleur. S'applique aux grilles vides.
- `opacity: 0;` : Active l'état invisible. Pendant très longtemps, les ennemis perdent votre traçabilité et arrêtent les tirs.
- `filter: blur(10px);` : Floute dramatiquement le monde et les ennemis existants, ce qui dérange la vision de l'IA (entité `CSS_BLUR`).
- `font-size: 40px;` : Modifie considérablement la taille brute des particules ASCI du monde autour de vous. Puissance proportionnelle à votre combo.
- `font-weight: bold;` : Solidifie les murs. Les caractères et les blocs proches de vous deviennent d'épais **MURS INFRANCHISSABLES** pour retenir une infection !
- `font-style: italic;` : Oblique/couche le monde dans l'espace avoisinant !
- `animate(ascii)` : Gènere des entités mèmes animées physiquement comme des "flip table" ou des "shrugs" sur la grille !
- `CSS.animate({scale: 2})` : Vous grandissez littéralement. Votre cursor gagne en "PWR" (puissance) ce qui multiplie la taille de l'influence de chacune des méthodes suivantes selon un ratio gigantesque !

### Mutation et Pouvoir Brut
- `mute()` ou `purge()` : Extermine à 100% de la zone (fonctionnalité _wipe_) effaçant murs, ennemis et alliés, redonnant un son apaisant. Rayon variable (`radius: 10`). L'amplification par `CSS.animate` modifie son champ de vision de façon radicale.
- `mutate({char: '@', color: '#fff', radius: 10})` : Tous les ennemis environnants sont corrompus par _vous_ devenant vos loyaux pixels "amis", ce qui détruit les essaims instantanément au lieu de les purger.

### Instructions Systémiques (Physical Parsing)
- `if (condition)` ou contenant `else` : Tranche l'univers de jeu en deux avec un immense MURS physique horizontal ou vertical (`|`).
- `while(true) { ... }` : Déclenche l'entité redoutable **BLACK HOLE** (Trou Noir). Il purge en boucle infinie (effaçant le monde et la vie en son sein) en générant des alertes de sécurité dans toutes les directions (Projectiles qui blessent les IAs et le boss).

## 3. COMBOS & SONS (MUSIQUE GENERATIVE SYMPHONIQUE)
- Taper sur votre clavier ou vous déplacer gère un séquençage musical continu sur des bases gammes majeures ou mineures !
- Les sons lourds et les "bips graves" de l'ancien temps ont été purgés du serveur au profit de sons poétiques (sine) progressant à travers les actions et le niveau (octaves fluides selon le nombre d'action effectuées !).
- Frapper un mur (Hit) ou subir des dégats modifie de force la timeline musicale, poussant à une dissonance momentanée ou de courtes mélodies triangulaires descendantes. Il ne peut plus y avoir de "bruit affreux", juste un avertissement harmonieux !

---

> _"Le code n'est plus du texte. Le code est l'arme. Tapez pour vivre."_
