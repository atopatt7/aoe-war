# 🎮 橫向塔防遊戲 — 完整角色美術資產規格
> 跨時代戰爭 · 20角色全套 Prompt 資料庫
> 適用：圖像生成AI / 音效生成AI / Phaser遊戲開發

---

## 📐 全域美術規格（所有角色共用）

```
風格基準：2D 橫向 · 側面視角 · Q版比例（頭:身 = 1:2）
美術語彙：flat cartoon · chibi · clear black outline · high contrast colors · simplified details
方向：角色面向右（facing right）
背景：透明（transparent background）
解析度：512×512 px（Idle） / 2048×512 px（Attack Sprite Sheet 4-frame）
動畫格數：4~6幀 · 每幀間距 120ms · 播放一次（one-shot）
```

---

## ═══════════════════════════════
## 🪨 時代一：石器時代（Stone Age）
## ═══════════════════════════════

---

### 角色 01 ─ 野蠻人（Barbarian）
**兵種：劍士 / 近戰**

【美術描述】
石器時代肌肉型近戰戰士，身穿破爛獸皮背心，頭戴骨頭頭飾，手持粗糙石斧。Q版大頭比例，表情兇猛帶點搞笑，深棕色皮膚，橘棕毛皮配色。輪廓粗黑線，扁平卡通風。

【Idle Prompt】
```
2D flat cartoon chibi barbarian warrior, stone age era, holding large rough stone axe in right hand, wearing torn brown animal skin vest, bone headband accessory, muscular but chibi 1:2 head-to-body ratio, fierce grinning expression, dark tan skin, side view facing right, idle standing pose with slight weight shift, thick black outline, high contrast warm earth tones (brown, orange, bone white), transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi stone age barbarian swinging stone axe attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] wind-up raise axe overhead, [2] full overhead raised with exaggerated lean back, [3] mid-swing axe coming down with motion blur arc, [4] impact pose axe at lowest point dust particles, [5] recovery recoil pose, each frame 512x512px, total 2560x512px, transparent background, consistent chibi proportions throughout, earth tone color palette
```

【Attack SFX Prompt】
```
short punchy primitive stone axe swing and impact sound, whoosh followed by heavy dull thud, dry stone-on-bone hit, low pitch, 0.3 seconds, mono, game SFX style, no reverb, clean cut
```

---

### 角色 02 ─ 投石手（Stone Thrower）
**兵種：弓箭手 / 遠程**

【美術描述】
石器時代瘦弱遠程攻擊者，手持圓形大石頭準備投擲，穿著簡單草裙和獸皮，頭髮蓬亂。Q版小個子，眼睛大，投擲動作誇張，石頭比頭還大製造喜感。棕黃色調配青苔綠。

【Idle Prompt】
```
2D flat cartoon chibi stone thrower, stone age era, holding oversized round rock in both hands, wearing simple grass skirt and animal skin wrap, wild messy hair, small scrawny chibi body, big expressive eyes, slightly hunched idle pose, side view facing right, thick black outline, high contrast brown and tan color palette with green accents, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi stone thrower throwing giant rock attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] idle holding rock at waist, [2] crouch wind-up pulling rock back behind body, [3] full throw launch exaggerated lean forward arm extended, [4] follow-through arm fully forward rock leaving hand with speed lines, [5] recovery stumble pose arms out for balance, each frame 512x512px, total 2560x512px, transparent background
```

【Attack SFX Prompt】
```
stone throwing sound, short grunt effort followed by rock whoosh through air, medium pitch swish, 0.4 seconds, primitive stone age feel, game SFX style, no music
```

---

### 角色 03 ─ 胖胖（Fat Shielder）
**兵種：肉盾**

【美術描述】
石器時代超級胖壯的肉盾角色，圓滾滾大肚腩，手持巨大圓木盾牌，另一手握短石棍。表情開朗傻氣，頭頂一撮毛，全身圓潤。Q版極度誇張胖體型，配色以米色和深棕為主。

【Idle Prompt】
```
2D flat cartoon chibi extremely fat stone age shield bearer, comically round body with huge belly, holding oversized crude wooden shield in left arm, short stone club in right hand, single tuft of hair on top of bald head, cheerful dopey expression, very wide stance, chibi proportions with extra-wide body, side view facing right, thick black outline, high contrast beige, dark brown, and tan color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 4 frames horizontal layout, fat chibi stone age shielder bash attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] idle shield held up, [2] raise short club high body leaning back comically, [3] slam club down heavy impact pose body compressed, [4] rebound bounce back recovery wobble pose, each frame 512x512px, total 2048x512px, transparent background
```

【Attack SFX Prompt】
```
short blunt stone club thump sound, heavy dull impact with a slight comedic bounce wobble, low bass thud, fat and round sound, 0.3 seconds, game SFX, clean
```

---

### 角色 04 ─ 巫醫（Witch Doctor）
**兵種：法師 / 魔法**

【美術描述】
石器時代神秘巫醫，戴著巨大骨骸面具，穿羽毛裝飾長裙，持骨頭法杖。體型細長Q版，神秘感十足，法杖頂端有光暈效果。配色以骨白、深紫、橘黃為主，魔法感強烈。

【Idle Prompt】
```
2D flat cartoon chibi stone age witch doctor shaman, wearing oversized skull bone mask covering face, decorated feather and bone robe skirt, holding tall bone staff with glowing orb at top, slender chibi body, mysterious floating idle pose with slight sway, glowing purple-orange magical aura around staff tip, side view facing right, thick black outline, high contrast bone white, deep purple, and amber color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi witch doctor casting magic spell animation, side view facing right, flat cartoon style, thick black outline, frames: [1] staff raised begin chant with small glow, [2] chanting pose staff glowing brighter purple energy gathering, [3] peak cast pose staff aimed forward large energy ball forming, [4] release explosion blast of purple-orange magic orbs forward, [5] recoil stumble recovery staff down smoke effect, each frame 512x512px, total 2560x512px, transparent background
```

【Attack SFX Prompt】
```
primitive magic spell cast sound, bone rattling followed by mystic whoosh and low resonant hum, tribal and mystical feel, slight echo, 0.5 seconds, game SFX style
```

---

## ═══════════════════════════════
## ⚔️ 時代二：封建時代（Feudal Age）
## ═══════════════════════════════

---

### 角色 05 ─ 民兵劍士（Militia Swordsman）
**兵種：劍士 / 近戰**

【美術描述】
封建時代農民出身的民兵，穿著簡陋皮甲，手持生鏽鐵劍和小圓盾，臉上有傷疤，表情堅毅。Q版比例，護甲有補丁感，顏色以鐵灰、棕色、米白為主。比石器時代更有秩序感的服裝設計。

【Idle Prompt】
```
2D flat cartoon chibi feudal age militia swordsman, wearing patched leather armor with simple iron pauldron, holding rusty iron sword in right hand and small round wooden shield in left, facial scar, determined expression, slightly worn equipment look, chibi 1:2 head-to-body ratio, idle guard stance, side view facing right, thick black outline, high contrast iron grey, brown leather, and off-white color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi militia swordsman slashing sword attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] guard stance sword at side, [2] step forward sword raised overhead, [3] diagonal slash downward motion arc slash effect, [4] impact follow-through sword at low angle spark effect, [5] recovery pull back to guard, each frame 512x512px, total 2560x512px, transparent background
```

【Attack SFX Prompt】
```
iron sword slash and swing sound, metallic whoosh with medium clang impact, slightly dull rusty sword sound, 0.3 seconds, medieval game SFX, clean crisp
```

---

### 角色 06 ─ 長弓手（Longbowman）
**兵種：弓箭手 / 遠程**

【美術描述】
封建時代英式長弓手，高挑Q版身材，持超長木弓，箭袋掛背後，穿簡單綠色皮甲，戴皮帽。姿勢優雅專注，表情瞇眼瞄準。配色以草綠、深棕、米黃為主，箭羽橘黃色點綴。

【Idle Prompt】
```
2D flat cartoon chibi feudal longbowman archer, wearing simple green leather jerkin with brown belt, leather cap hat, quiver on back with arrows, holding tall longbow in left hand, focused squinting expression, taller slender chibi proportions, relaxed ready stance, side view facing right, thick black outline, high contrast forest green, dark brown, and ochre yellow color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi longbowman shooting arrow attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] reach back to quiver for arrow, [2] nock arrow to bowstring, [3] full draw bow bent dramatically arms spread, [4] release arrow fires with exaggerated recoil bow vibrating string lines, [5] recovery lower bow follow-through pose, each frame 512x512px, total 2560x512px, transparent background
```

【Attack SFX Prompt】
```
longbow draw and arrow release sound, taut string tension creak followed by sharp twang and arrow whoosh, crisp wooden bow sound, 0.35 seconds, medieval archery SFX, clean
```

---

### 角色 07 ─ 盾衛兵（Shield Guard）
**兵種：肉盾**

【美術描述】
封建時代標準盾牌兵，穿著鏈甲和頭盔，持方形大鐵盾，短劍掛腰際。方正穩重的Q版體型，表情嚴肅，姿勢紮實。配色以銀鐵、藍灰、深紅紋章為主，盾牌上有簡單紋章圖案。

【Idle Prompt】
```
2D flat cartoon chibi feudal shield guard, wearing chainmail armor and simple iron bucket helmet, holding large rectangular iron shield in left arm with simple heraldry cross emblem, short sword at hip, stocky solid chibi body, serious stoic expression, firm planted stance, side view facing right, thick black outline, high contrast silver grey, blue-grey, and deep red accent color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 4 frames horizontal layout, chibi shield guard shield bash attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] shield held upright guard position, [2] step forward shield pulled back wind-up, [3] powerful shield bash forward slam impact stars burst effect, [4] recoil recovery plant feet firm, each frame 512x512px, total 2048x512px, transparent background
```

【Attack SFX Prompt】
```
heavy iron shield bash impact sound, solid metallic clang with echo, authoritative iron-on-iron hit, deep resonance, 0.3 seconds, medieval SFX, clean
```

---

### 角色 08 ─ 見習術士（Apprentice Mage）
**兵種：法師 / 魔法**

【美術描述】
封建時代年輕見習魔法師，戴過大的藍色尖頂巫師帽（帽子歪斜），穿寬鬆藍色法師袍，持木製魔杖，書本掛腰。Q版小個子，表情緊張又興奮，法術有點不穩定的感覺。配色以藍色、米白、金色為主。

【Idle Prompt】
```
2D flat cartoon chibi feudal apprentice mage, wearing oversized tilted blue pointed wizard hat with gold star, baggy blue wizard robe too large for small body, wooden wand in right hand, small spellbook hanging at hip, young nervous excited expression, small chibi proportions, idle pose with slight nervous fidget, small magical sparks around wand tip, side view facing right, thick black outline, high contrast royal blue, cream white, and gold color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi apprentice mage casting unstable magic bolt animation, side view facing right, flat cartoon style, thick black outline, frames: [1] read spellbook quickly frantic expression, [2] point wand forward determined squinting, [3] unstable magic spark gathering at wand tip sputtering, [4] fire wobbly blue magic bolt wild zigzag trail forward, [5] recoil blown back by own spell stumble fall backward recover, each frame 512x512px, total 2560x512px, transparent background
```

【Attack SFX Prompt】
```
unstable magic apprentice spell sound, crackling electric pop and fizz followed by wobbly zap tone, slightly comedic uncertain magic sound, light and airy, 0.4 seconds, fantasy game SFX
```

---

## ═══════════════════════════════
## 🏰 時代三：城堡時代（Castle Age）
## ═══════════════════════════════

---

### 角色 09 ─ 重甲騎士（Heavy Knight）
**兵種：劍士 / 近戰**

【美術描述】
城堡時代全副武裝的重甲騎士，穿銀光閃閃的全身板甲，持巨型雙手劍，盾牌背在背上，頭盔有羽毛裝飾。Q版但威武感十足，身形比例寬壯，步伐沉穩有力。配色以銀、深藍、金為主，帶有貴族氣息。

【Idle Prompt】
```
2D flat cartoon chibi castle age heavy knight, wearing full shining silver plate armor with decorative blue plume on helmet, holding massive two-handed greatsword pointed down, shield on back, proud noble expression visible through visor gap, wide sturdy chibi body build, confident power stance, slight armor gleam highlight, side view facing right, thick black outline, high contrast silver, deep navy blue, and gold trim color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi heavy knight greatsword cleave attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] sword resting on shoulder ready stance, [2] both hands grip sword raise overhead dramatic windup, [3] peak overhead with glowing sword edge charging energy, [4] massive downward cleave swing blue energy arc slash effect, [5] planted deep follow-through sword buried in ground briefly dust cloud, each frame 512x512px, total 2560x512px, transparent background
```

【Attack SFX Prompt】
```
heavy plate armor knight massive sword cleave sound, powerful whoosh followed by heavy metallic crash impact, resonant steel ring echo, 0.4 seconds, epic medieval SFX, clean punch
```

---

### 角色 10 ─ 強弩射手（Crossbowman）
**兵種：弓箭手 / 遠程**

【美術描述】
城堡時代穿半身甲的強弩射手，持大型機械十字弓，腰帶掛弩箭，戴鐵製頭盔，表情冷靜專業。Q版但比封建時代更精良的裝備，配色以深灰、棕褐、鐵黑為主，十字弓有精細機械感。

【Idle Prompt】
```
2D flat cartoon chibi castle age crossbowman, wearing half-plate iron armor with iron helmet, holding large mechanical crossbow in both hands at ready position, bolt quiver at belt, calm professional expression, well-equipped appearance, solid stance, side view facing right, thick black outline, high contrast dark grey, brown leather, and iron black color palette with red bolt flights accent, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi crossbowman shooting crossbow bolt animation, side view facing right, flat cartoon style, thick black outline, frames: [1] crossbow aimed forward at shoulder height, [2] check aim narrow eyes steady, [3] trigger pull moment full tension, [4] bolt fires powerful recoil shoulder jolted back speed lines, [5] mechanical reload crank motion recovery, each frame 512x512px, total 2560x512px, transparent background
```

【Attack SFX Prompt】
```
mechanical crossbow trigger and bolt fire sound, heavy metal clunk trigger mechanism followed by powerful thwack and bolt whistle, mechanical satisfying sound, 0.35 seconds, medieval siege weapon SFX
```

---

### 角色 11 ─ 堡壘守衛（Fortress Guard）
**兵種：肉盾**

【美術描述】
城堡時代精銳守衛，穿全套精製板甲加披風，持大型塔盾（幾乎跟身體一樣大），短劍備用。Q版但比封建盾衛更威嚴，配色以深藍披風、銀甲、金紋為主，盾牌有城堡徽章。

【Idle Prompt】
```
2D flat cartoon chibi castle fortress guard elite soldier, wearing full polished plate armor with deep blue cape, holding massive tower shield with golden castle heraldry emblem almost body-width, short sword sheathed at hip, stern commanding expression, imposing wide stance, elite well-maintained equipment, side view facing right, thick black outline, high contrast silver plate, deep blue cape, and gold emblem color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 4 frames horizontal layout, chibi fortress guard tower shield slam and shockwave animation, side view facing right, flat cartoon style, thick black outline, frames: [1] tower shield held full upright defensive wall, [2] charge forward motion blur feet off ground, [3] massive shield slam ground impact creates shockwave crack lines ripple effect, [4] planted firm triumphant pose cape billowing, each frame 512x512px, total 2048x512px, transparent background
```

【Attack SFX Prompt】
```
massive tower shield ground slam impact, thunderous boom and metallic clang combined, ground shockwave rumble bass, epic and weighty, 0.45 seconds, castle defense SFX
```

---

### 角色 12 ─ 大法師（Archmage）
**兵種：法師 / 魔法**

【美術描述】
城堡時代威嚴大法師，穿紫色華麗法師長袍，白鬚長眉，持鑲寶石水晶法杖，頭戴星辰頭冠。Q版但散發強大氣場，法杖光芒耀眼，魔法粒子環繞全身。配色以深紫、金黃、白藍光效為主。

【Idle Prompt】
```
2D flat cartoon chibi castle age archmage, wearing magnificent deep purple ornate wizard robes with gold trim and embroidery, long white beard and thick white eyebrows, holding tall crystal-tipped jeweled staff glowing with blue-white magical energy, star constellation crown headpiece, magical floating particles orbiting body, wise powerful expression, side view facing right, thick black outline, high contrast deep purple, gold, and glowing blue-white magical light color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 6 frames horizontal layout, chibi archmage casting powerful meteor spell animation, side view facing right, flat cartoon style, thick black outline, frames: [1] idle staff upright magical glow, [2] raise staff overhead both hands magical energy swirling, [3] sky darkens ominous magical gathering staff blazing, [4] call down fiery meteor from above energy beam downward, [5] massive explosion impact ring shockwave fire particles, [6] recovery stately lower staff smoke clears calm demeanor, each frame 512x512px, total 3072x512px, transparent background
```

【Attack SFX Prompt】
```
powerful archmage meteor spell cast, deep magical resonance buildup with harmonic hum then massive explosion impact boom with mystical echo trail, cinematic and powerful, 0.6 seconds, epic fantasy SFX
```

---

## ═══════════════════════════════
## 🔫 時代四：現代（Modern Age）
## ═══════════════════════════════

---

### 角色 13 ─ 突擊兵（Assault Trooper）
**兵種：劍士 / 近戰**

【美術描述】
現代特種部隊近戰突擊兵，穿黑色戰術裝甲，持戰術刀和手槍，臉戴護目鏡和戰術面罩，裝備掛滿腰帶。Q版但充滿現代軍事感，動作敏捷俐落。配色以黑色、軍綠、橘色細節為主。

【Idle Prompt】
```
2D flat cartoon chibi modern assault trooper close combat soldier, wearing black tactical body armor with orange accent strips, combat knife in right hand, pistol holstered, tactical goggles and half face mask, pouches and gear on belt, agile ready stance with slight forward lean, side view facing right, thick black outline, high contrast black armor, military olive green, and orange accent color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi assault trooper knife slash combo attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] crouched ready knife held low, [2] dash forward blur lines speed motion, [3] upward slash knife strike yellow slash trail, [4] spin second slash crossing trail double slash, [5] land back crouch combat pose knife at ready, each frame 512x512px, total 2560x512px, transparent background
```

【Attack SFX Prompt】
```
tactical knife slash and combat movement sound, quick fabric swish followed by sharp blade slash sound, modern military crisp, 0.25 seconds, action game SFX, punchy
```

---

### 角色 14 ─ 步槍兵（Rifleman）
**兵種：弓箭手 / 遠程**

【美術描述】
現代軍隊步槍手，穿迷彩戰鬥服，持突擊步槍（M16風格），戴軍用頭盔，附夜視鏡，背彈藥袋。Q版但細節豐富，槍枝是身體的1.5倍大製造喜感。配色以迷彩綠棕、黑、橄欖綠為主。

【Idle Prompt】
```
2D flat cartoon chibi modern rifleman soldier, wearing camouflage combat uniform in green brown pattern, military helmet with night vision goggle attachment flipped up, holding oversized assault rifle (M16 style) proportionally larger than chibi body for comic effect, ammunition pouch vest, alert scanning expression, shoulder-carry rifle ready stance, side view facing right, thick black outline, high contrast olive drab, brown camo, and black color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 4 frames horizontal layout, chibi rifleman shoot burst fire attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] raise rifle to shoulder aim position squint eye, [2] firing pose muzzle flash at barrel tip body braced, [3] sustained burst multiple muzzle flashes shell casings ejecting, [4] lower rifle slightly scope still up ready for next burst, each frame 512x512px, total 2048x512px, transparent background
```

【Attack SFX Prompt】
```
assault rifle burst fire sound, sharp cracking gunshot burst 3 rounds rapid fire, muzzle pop and mechanical action, modern military firearm, 0.3 seconds, clear and impactful game SFX
```

---

### 角色 15 ─ 重裝兵（Heavy Trooper）
**兵種：肉盾**

【美術描述】
現代超重裝甲士兵，全身包覆厚重爆炸防護裝甲，圓滾滾的體型，持大型防爆盾，頭盔超級大，幾乎看不到臉。比現代版「胖胖」更科技感。Q版誇張圓體型。配色以黑、深灰、黃色警示線為主。

【Idle Prompt】
```
2D flat cartoon chibi modern heavy armor trooper, wearing exaggerated thick blast-proof riot armor making body extremely round and wide, oversized ballistic helmet visor barely showing eyes, holding large riot shield with yellow warning stripes, very round blob-like chibi body shape, heavy planted stance, side view facing right, thick black outline, high contrast black armor, dark grey, and yellow hazard stripe accent color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 4 frames horizontal layout, chibi heavy trooper riot shield charge attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] shield up hunched turtle defensive position, [2] begin charging forward leaving dust cloud behind, [3] full speed charge shield bash explosive impact shock ring, [4] skid stop planted momentum carried forward wobble recover, each frame 512x512px, total 2048x512px, transparent background
```

【Attack SFX Prompt】
```
heavy armored trooper shield slam impact, loud metallic crash and plastic crunch combined, modern tactical shield hit, reverberating thud, 0.35 seconds, modern military game SFX
```

---

### 角色 16 ─ 爆破專家（Demolitions Expert）
**兵種：範圍攻擊**

【美術描述】
現代爆破工兵，穿橘黃色爆破服，背炸藥包，持火箭筒，戴防爆頭盔，臉上有油污。Q版但充滿危險感，各種爆炸物掛滿身。表情有點瘋狂又高興。配色以橘黃、黑、深棕為主，加紅色危險標識。

【Idle Prompt】
```
2D flat cartoon chibi modern demolitions expert soldier, wearing bright orange blast suit with black padding, multiple TNT packs and grenades hanging all over body, holding rocket launcher on shoulder, explosive-proof helmet with cracked visor, oil smudge on face, manic grinning expression, side view facing right, thick black outline, high contrast orange, black, dark brown color palette with red danger symbol accents, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi demolitions expert rocket launcher fire animation, side view facing right, flat cartoon style, thick black outline, frames: [1] rocket launcher shouldered aim pose squinting, [2] dramatic lock-on aiming reticle appearing over eye, [3] ignition fire blast from back of launcher smoke cloud billows backward, [4] rocket fires forward massive back-blast blows chibi body hair and smoke, [5] recovery coughing through smoke thumbs up pose, each frame 512x512px, total 2560x512px, transparent background
```

【Attack SFX Prompt】
```
rocket launcher fire sound, ignition click followed by massive whooomp blast with secondary rumble, explosive back-blast air pressure, deep bass impact, 0.5 seconds, modern military explosive SFX, impactful
```

---

## ═══════════════════════════════
## 🚀 時代五：太空時代（Space Age）
## ═══════════════════════════════

---

### 角色 17 ─ 光刃戰士（Photon Blade Warrior）
**兵種：劍士 / 近戰**

【美術描述】
太空時代先進近戰戰士，穿白銀磁浮戰甲，手持發光藍色光刃劍（類似光劍但更未來感），頭盔全息顯示，推進器在腳踝。Q版但有科幻帥氣感，光刃有閃耀特效。配色以白銀、電藍、青色為主，發光效果。

【Idle Prompt】
```
2D flat cartoon chibi space age photon blade warrior, wearing sleek white silver magnetic levitation combat suit with glowing blue energy lines, holding radiant blue photon energy sword emitting light glow, full holographic helmet with HUD display, ankle thruster jets with small blue glow, cool determined expression visible through visor, floating slightly off ground idle hover, side view facing right, thick black outline, high contrast white silver, electric blue, and cyan color palette with bright glow effects, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi photon warrior high-speed dash slash animation, side view facing right, flat cartoon style, thick black outline, frames: [1] hover idle photon blade ready at side glowing, [2] ankle thrusters ignite dash preparation energy coil, [3] blur dash forward leaving light trail afterimage, [4] photon blade slash massive energy arc cutting X pattern light slash, [5] stop pose photon blade tip forward energy dissipating glow fade, each frame 512x512px, total 2560x512px, transparent background
```

【Attack SFX Prompt】
```
futuristic photon energy blade slash sound, smooth electronic hum with sudden high-pitched energy slash and crisp sci-fi impact tone, light and sharp, 0.3 seconds, sci-fi game SFX, clean digital
```

---

### 角色 18 ─ 雷射射手（Laser Sniper）
**兵種：弓箭手 / 遠程**

【美術描述】
太空時代精密雷射狙擊手，穿流線型偵察裝甲，持超長光子狙擊步槍（比身體長兩倍），單眼雷射瞄準器，半透明護盾產生器。Q版細長身材，動作精準。配色以深空黑、螢光綠、銀白為主。

【Idle Prompt】
```
2D flat cartoon chibi space age laser sniper scout, wearing sleek dark space recon armor with green energy highlights, holding extremely long photon sniper rifle twice chibi body length, single targeting monocle laser sight on eye glowing green, small personal shield generator on arm, lean precise chibi body type, calculating expression with one eye narrowed, ready alert stance, side view facing right, thick black outline, high contrast deep space black, neon green, and silver white color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 5 frames horizontal layout, chibi laser sniper charge and fire animation, side view facing right, flat cartoon style, thick black outline, frames: [1] raise rifle shoulder level monocle flicker, [2] charge shot green energy builds in rifle barrel glowing, [3] full charge barrel blazing about to fire intense glow, [4] fire concentrated laser beam straight line piercing light with recoil body pushed back, [5] rifle smoking cooling down lower weapon precision stance, each frame 512x512px, total 2560x512px, transparent background
```

【Attack SFX Prompt】
```
futuristic laser sniper charge and beam fire sound, rising electronic whine charge-up followed by sharp sustained laser beam hiss, sci-fi precision weapon, 0.45 seconds, space game SFX, clean electronic
```

---

### 角色 19 ─ 能量護衛（Energy Shield Guardian）
**兵種：肉盾**

【美術描述】
太空時代能量護盾守護者，穿巨大磁力重甲，前方持巨型能量護盾（半透明光盾，比身體寬），護盾不斷閃爍能量波紋。Q版圓壯體型，能量盾有特效光芒。配色以深藍、青色、白光為主，能量感強烈。

【Idle Prompt】
```
2D flat cartoon chibi space age energy shield guardian, wearing massive magnetic heavy power armor with blue energy lines, projecting large semi-transparent glowing energy shield panel in left arm wider than body with pulsing energy ripple pattern, heavy stocky chibi build, visor glowing white, stance firm and immovable, energy barrier shimmering with light waves, side view facing right, thick black outline, high contrast deep navy blue, cyan, and brilliant white energy glow color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 4 frames horizontal layout, chibi energy guardian shield pulse burst attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] energy shield at full glow defensive ready, [2] charge energy into shield concentrated power building in center, [3] release shockwave pulse ring explodes outward from shield concentric energy rings, [4] post-pulse shield returns to steady glow planted recovery stance, each frame 512x512px, total 2048x512px, transparent background
```

【Attack SFX Prompt】
```
energy shield pulse burst activation sound, deep electronic hum buildup followed by resonant shockwave blast with high-frequency ring, powerful sci-fi energy weapon, 0.4 seconds, space age SFX, clean digital bass
```

---

### 角色 20 ─ 星能術士（Stellar Sorcerer）
**兵種：法師 / 魔法科技**

【美術描述】
太空時代融合科技與神秘力量的星能術士，穿深紫色能量法袍（有電路板紋路），持水晶量子法杖（有全息螢幕顯示），頭戴星環頭飾（會旋轉），身旁飄浮能量球體。Q版最終BOSS感的神秘氣質。配色以深紫、金黃、星白、量子藍為主。

【Idle Prompt】
```
2D flat cartoon chibi space age stellar sorcerer, wearing deep purple energy robe with glowing circuit board patterns, holding quantum crystal staff with holographic display screen showing star map, orbital star ring headpiece slowly rotating around head, multiple floating luminous energy orbs hovering around body, powerful otherworldly expression, slightly levitating idle pose, cosmic star particles emanating, side view facing right, thick black outline, high contrast deep purple, gold, star white, and quantum blue glow color palette, transparent background, 512x512px, game sprite style
```

【Attack Animation Prompt】
```
2D sprite sheet, 6 frames horizontal layout, chibi stellar sorcerer summon black hole attack animation, side view facing right, flat cartoon style, thick black outline, frames: [1] staff raised cosmic energy gathering orbital rings spinning faster, [2] quantum calculation hologram displays activating, [3] open dimensional rift swirling void portal appearing in front of staff, [4] miniature black hole forms pulls in surrounding energy dramatic effect, [5] explosive release gravitational blast shockwave ring nebula explosion, [6] close rift composure regained orbital rings slowly resume calm rotation, each frame 512x512px, total 3072x512px, transparent background
```

【Attack SFX Prompt】
```
stellar sorcerer cosmic black hole spell sound, ethereal space ambience with electronic choir harmonic, building into gravitational distortion drone then massive cosmic explosion with deep bass and trailing star shimmer, epic and otherworldly, 0.6 seconds, space fantasy ultimate SFX
```

---

## 📋 資產總覽表

| # | 角色名稱 | 時代 | 兵種 | Idle | Attack | SFX |
|---|---------|------|------|------|--------|-----|
| 01 | 野蠻人 | 石器 | 劍士 | ✅ | 5幀 | ✅ |
| 02 | 投石手 | 石器 | 遠程 | ✅ | 5幀 | ✅ |
| 03 | 胖胖 | 石器 | 肉盾 | ✅ | 4幀 | ✅ |
| 04 | 巫醫 | 石器 | 法師 | ✅ | 5幀 | ✅ |
| 05 | 民兵劍士 | 封建 | 劍士 | ✅ | 5幀 | ✅ |
| 06 | 長弓手 | 封建 | 遠程 | ✅ | 5幀 | ✅ |
| 07 | 盾衛兵 | 封建 | 肉盾 | ✅ | 4幀 | ✅ |
| 08 | 見習術士 | 封建 | 法師 | ✅ | 5幀 | ✅ |
| 09 | 重甲騎士 | 城堡 | 劍士 | ✅ | 5幀 | ✅ |
| 10 | 強弩射手 | 城堡 | 遠程 | ✅ | 5幀 | ✅ |
| 11 | 堡壘守衛 | 城堡 | 肉盾 | ✅ | 4幀 | ✅ |
| 12 | 大法師 | 城堡 | 法師 | ✅ | 6幀 | ✅ |
| 13 | 突擊兵 | 現代 | 劍士 | ✅ | 5幀 | ✅ |
| 14 | 步槍兵 | 現代 | 遠程 | ✅ | 4幀 | ✅ |
| 15 | 重裝兵 | 現代 | 肉盾 | ✅ | 4幀 | ✅ |
| 16 | 爆破專家 | 現代 | 範圍 | ✅ | 5幀 | ✅ |
| 17 | 光刃戰士 | 太空 | 劍士 | ✅ | 5幀 | ✅ |
| 18 | 雷射射手 | 太空 | 遠程 | ✅ | 5幀 | ✅ |
| 19 | 能量護衛 | 太空 | 肉盾 | ✅ | 4幀 | ✅ |
| 20 | 星能術士 | 太空 | 法師 | ✅ | 6幀 | ✅ |

**總計：20 角色 × 3 資產類型 = 60 個生成任務**
**Idle：20個 | Attack Sprite Sheet：20個 | SFX：20個**

---

## 🛠️ 生成工具推薦

### 圖像生成
| 工具 | 用途 | 備註 |
|------|------|------|
| **Midjourney** | Idle + Attack | 加 `--ar 1:1` 或 `--ar 4:1` |
| **Stable Diffusion** | 批次生成 | 用 AnimateDiff 做動畫 |
| **DALL·E 3** | 快速測試 | 透過 ChatGPT |
| **Adobe Firefly** | 商業授權 | 建議正式資產 |

### 音效生成
| 工具 | 用途 |
|------|------|
| **ElevenLabs SFX** | AI音效生成，直接貼SFX Prompt |
| **Suno** | 輔助音樂氛圍 |
| **Adobe Audition** | 後製調整長度 |
| **Freesound.org** | 現成素材參考 |

### Phaser 整合
```javascript
// 載入 Sprite Sheet 範例
this.load.spritesheet('barbarian_attack', 
  'assets/barbarian_attack.png',
  { frameWidth: 512, frameHeight: 512 }
);

// 播放攻擊動畫（one-shot）
this.anims.create({
  key: 'barbarian_attack',
  frames: this.anims.generateFrameNumbers('barbarian_attack', { start: 0, end: 4 }),
  frameRate: 8,  // 120ms per frame
  repeat: 0      // one-shot
});
```

---

## 🎨 色彩風格快速參考

| 時代 | 主色調 | 特色 |
|------|--------|------|
| 石器時代 | 棕、橘、骨白 | 原始自然，泥土感 |
| 封建時代 | 鐵灰、軍綠、棕褐 | 農業文明，手工感 |
| 城堡時代 | 銀、深藍、金 | 貴族感，精工甲冑 |
| 現代 | 黑、軍綠、橘 | 戰術感，高科技 |
| 太空時代 | 深紫、青藍、白光 | 發光效果，未來感 |

---

*版本：v1.0 | 生成日期：2026-03-20 | 用途：橫向塔防遊戲 跨時代戰爭*
