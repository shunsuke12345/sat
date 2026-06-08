/* ===================================================================
   SAT VOCAB BATTLE ROYALE — script.js
   Pure vanilla JS. No frameworks, no build step.

   Data model is intentionally structured for a future Supabase /
   realtime multiplayer upgrade:
     - vocabDB[]      : the vocabulary database
     - players[]      : ALL 100 players (humans + AI) in one array
     - humanPlayer    : a separate handle to the local human's object
   Look for  // SUPABASE:  markers showing where network calls go.
   =================================================================== */

'use strict';

/* ===================================================================
   1. VOCABULARY DATABASE  (210+ SAT words)
   Each entry: word, def (correct), wrong[3], syn, ant, sentence.
   `sentence` always contains the word so we can blank it out for the
   fill-in-the-blank question type.
   =================================================================== */
const vocabDB = [
  { word:"ambiguous", def:"open to more than one interpretation; unclear", wrong:["perfectly clear and exact","extremely large in size","happening very quickly"], syn:"unclear", ant:"clear", sentence:"The ambiguous ending left readers arguing about what really happened." },
  { word:"concede", def:"to admit or acknowledge, often reluctantly; to yield", wrong:["to attack without mercy","to celebrate loudly","to hide from view"], syn:"yield", ant:"deny", sentence:"She refused to concede that her plan had any flaws." },
  { word:"subtle", def:"so delicate or precise as to be hard to notice", wrong:["loud and obvious","rough and heavy","brightly colored"], syn:"delicate", ant:"obvious", sentence:"There was a subtle change in his tone that only she noticed." },
  { word:"undermine", def:"to weaken or sabotage gradually", wrong:["to support strongly","to build up quickly","to praise openly"], syn:"sabotage", ant:"strengthen", sentence:"Constant criticism can undermine a child's confidence." },
  { word:"meticulous", def:"showing great attention to detail; very careful", wrong:["sloppy and careless","extremely lazy","loud and rude"], syn:"thorough", ant:"careless", sentence:"The accountant was meticulous about every figure in the report." },
  { word:"pragmatic", def:"dealing with things practically rather than idealistically", wrong:["guided only by emotion","completely unrealistic","based on superstition"], syn:"practical", ant:"idealistic", sentence:"She took a pragmatic approach and chose the cheapest workable option." },
  { word:"candid", def:"truthful and straightforward; frank", wrong:["secretive and evasive","extremely shy","falsely flattering"], syn:"frank", ant:"evasive", sentence:"He gave a candid assessment of the team's weaknesses." },
  { word:"dubious", def:"hesitating or doubting; questionable", wrong:["completely certain","openly joyful","highly respected"], syn:"doubtful", ant:"certain", sentence:"I was dubious about the salesman's extravagant claims." },
  { word:"negligible", def:"so small as to be not worth considering", wrong:["enormous and important","dangerously toxic","brightly glowing"], syn:"insignificant", ant:"significant", sentence:"The price difference was negligible, so she bought the closer one." },
  { word:"coherent", def:"logical and consistent; clearly connected", wrong:["confused and disjointed","extremely loud","physically sticky"], syn:"logical", ant:"confused", sentence:"He was too tired to give a coherent explanation." },
  { word:"imminent", def:"about to happen very soon", wrong:["far in the distant future","highly unlikely","already long past"], syn:"impending", ant:"distant", sentence:"Dark clouds warned of an imminent storm." },
  { word:"benevolent", def:"kind and wishing to do good", wrong:["cruel and spiteful","cold and indifferent","greedy and selfish"], syn:"kind", ant:"malevolent", sentence:"The benevolent donor funded scholarships for poor students." },
  { word:"belligerent", def:"hostile and eager to fight", wrong:["calm and peaceful","shy and timid","generous and giving"], syn:"hostile", ant:"peaceful", sentence:"The belligerent customer shouted at the staff over a small mistake." },
  { word:"loquacious", def:"very talkative", wrong:["completely silent","slow to learn","easily frightened"], syn:"talkative", ant:"reticent", sentence:"Our loquacious guide never stopped chatting during the tour." },
  { word:"magnanimous", def:"generous and forgiving, especially toward a rival", wrong:["petty and vengeful","stingy with money","weak and fearful"], syn:"generous", ant:"petty", sentence:"In victory she was magnanimous, praising her defeated opponent." },
  { word:"ephemeral", def:"lasting for a very short time", wrong:["lasting forever","extremely heavy","brightly colored"], syn:"fleeting", ant:"permanent", sentence:"The beauty of the cherry blossoms is ephemeral, gone within days." },
  { word:"aberration", def:"a departure from what is normal or expected", wrong:["a usual routine event","a written agreement","a loud celebration"], syn:"anomaly", ant:"norm", sentence:"His angry outburst was an aberration from his usual calm." },
  { word:"equivocal", def:"open to more than one interpretation; ambiguous", wrong:["perfectly definite","extremely honest","very loud"], syn:"ambiguous", ant:"unequivocal", sentence:"The witness gave an equivocal answer that satisfied no one." },
  { word:"cogent", def:"clear, logical, and convincing", wrong:["weak and unconvincing","funny and silly","vague and rambling"], syn:"convincing", ant:"unconvincing", sentence:"She made a cogent argument that changed everyone's mind." },
  { word:"austere", def:"severe or strict in manner; plain and without luxury", wrong:["warm and indulgent","wildly decorated","cheerful and playful"], syn:"stern", ant:"lavish", sentence:"The monk lived an austere life with few possessions." },
  { word:"didactic", def:"intended to teach, often morally", wrong:["meant only to entertain","completely meaningless","designed to confuse"], syn:"instructive", ant:"entertaining", sentence:"The fable had a didactic purpose, teaching honesty." },
  { word:"ostentatious", def:"showy in a way meant to impress", wrong:["modest and understated","dull and plain","quiet and shy"], syn:"showy", ant:"modest", sentence:"He drove an ostentatious gold car to flaunt his wealth." },
  { word:"perfidious", def:"deceitful and untrustworthy", wrong:["loyal and faithful","generous and kind","brave and bold"], syn:"treacherous", ant:"loyal", sentence:"The perfidious ally secretly betrayed them to the enemy." },
  { word:"sycophant", def:"a person who flatters others to gain advantage", wrong:["a brave leader","a harsh critic","a skilled doctor"], syn:"flatterer", ant:"critic", sentence:"The king was surrounded by sycophants who praised his every word." },
  { word:"obsequious", def:"excessively eager to please or obey", wrong:["rude and defiant","cold and distant","bold and fearless"], syn:"fawning", ant:"domineering", sentence:"The obsequious waiter kept bowing and complimenting the guests." },
  { word:"acrimony", def:"bitterness or ill feeling", wrong:["warm friendship","calm patience","sweet taste"], syn:"bitterness", ant:"goodwill", sentence:"The divorce was full of acrimony and shouting." },
  { word:"alacrity", def:"brisk and cheerful eagerness", wrong:["slow reluctance","deep sadness","quiet fear"], syn:"eagerness", ant:"reluctance", sentence:"She accepted the challenge with alacrity." },
  { word:"amalgamate", def:"to combine or unite into one", wrong:["to break into pieces","to ignore completely","to slow down"], syn:"merge", ant:"separate", sentence:"The two companies amalgamated into a single firm." },
  { word:"ambivalent", def:"having mixed or contradictory feelings", wrong:["completely certain","strongly opposed","wildly enthusiastic"], syn:"conflicted", ant:"certain", sentence:"She felt ambivalent about moving, excited yet sad." },
  { word:"anachronism", def:"something out of its proper time period", wrong:["a modern invention","a perfect schedule","a foreign language"], syn:"misplacement", ant:"contemporaneity", sentence:"A smartphone in a medieval film is an obvious anachronism." },
  { word:"antipathy", def:"a strong feeling of dislike", wrong:["deep affection","mild curiosity","calm indifference"], syn:"hostility", ant:"affection", sentence:"There was clear antipathy between the two rival coaches." },
  { word:"apathy", def:"lack of interest or concern", wrong:["intense passion","fierce anger","deep sympathy"], syn:"indifference", ant:"enthusiasm", sentence:"Voter apathy led to a very low turnout." },
  { word:"arduous", def:"requiring great effort; difficult and tiring", wrong:["easy and effortless","quick and simple","fun and relaxing"], syn:"strenuous", ant:"easy", sentence:"The climb up the mountain was long and arduous." },
  { word:"articulate", def:"able to express ideas clearly and fluently", wrong:["unable to speak clearly","extremely shy","physically weak"], syn:"eloquent", ant:"inarticulate", sentence:"She was articulate and persuasive during the debate." },
  { word:"ascetic", def:"practicing severe self-discipline and avoiding pleasure", wrong:["indulgent and luxurious","loud and social","greedy for wealth"], syn:"abstinent", ant:"indulgent", sentence:"The ascetic hermit owned nothing but a robe and a bowl." },
  { word:"assiduous", def:"showing great care and persistent effort", wrong:["lazy and careless","quick to give up","easily distracted"], syn:"diligent", ant:"lazy", sentence:"Her assiduous study paid off with a top score." },
  { word:"astute", def:"shrewd and perceptive", wrong:["foolish and naive","slow and dull","clumsy and awkward"], syn:"shrewd", ant:"naive", sentence:"An astute investor, he sold his shares just before the crash." },
  { word:"audacious", def:"showing bold, daring confidence", wrong:["timid and fearful","dull and ordinary","quiet and modest"], syn:"bold", ant:"timid", sentence:"The audacious thief robbed the bank in broad daylight." },
  { word:"auspicious", def:"suggesting a good chance of success; favorable", wrong:["threatening disaster","completely neutral","sad and gloomy"], syn:"favorable", ant:"ominous", sentence:"A sunny morning seemed an auspicious start to the trip." },
  { word:"avarice", def:"extreme greed for wealth", wrong:["generous giving","calm contentment","reckless courage"], syn:"greed", ant:"generosity", sentence:"His avarice drove him to cheat his own family." },
  { word:"banal", def:"so ordinary as to be boring; unoriginal", wrong:["fresh and original","shocking and rare","deeply profound"], syn:"trite", ant:"original", sentence:"The movie's banal plot put the audience to sleep." },
  { word:"beguile", def:"to charm or deceive, often in a tricky way", wrong:["to repel harshly","to bore completely","to warn loudly"], syn:"charm", ant:"repel", sentence:"The con artist beguiled investors with false promises." },
  { word:"bellicose", def:"eager to fight; warlike", wrong:["peaceful and gentle","shy and quiet","kind and caring"], syn:"aggressive", ant:"peaceable", sentence:"His bellicose speech called for immediate war." },
  { word:"benign", def:"gentle and harmless; kindly", wrong:["dangerous and harmful","loud and rude","cold and greedy"], syn:"harmless", ant:"harmful", sentence:"The tumor turned out to be benign, to everyone's relief." },
  { word:"blatant", def:"completely obvious, usually in a bad way", wrong:["subtle and hidden","gentle and quiet","rare and unusual"], syn:"flagrant", ant:"subtle", sentence:"That was a blatant lie that fooled no one." },
  { word:"bolster", def:"to support or strengthen", wrong:["to weaken severely","to ignore fully","to tear apart"], syn:"reinforce", ant:"undermine", sentence:"New evidence bolstered her argument." },
  { word:"brusque", def:"abrupt or curt in manner; blunt", wrong:["warm and chatty","slow and gentle","shy and timid"], syn:"curt", ant:"gracious", sentence:"His brusque reply made her feel unwelcome." },
  { word:"capricious", def:"given to sudden, unpredictable changes", wrong:["steady and reliable","slow and careful","calm and constant"], syn:"fickle", ant:"steady", sentence:"The capricious weather shifted from sun to storm in minutes." },
  { word:"censure", def:"strong formal disapproval or criticism", wrong:["warm praise","quiet approval","gentle encouragement"], syn:"condemn", ant:"praise", sentence:"The senator faced censure for his misconduct." },
  { word:"circumspect", def:"cautious; careful to consider consequences", wrong:["reckless and rash","loud and bold","careless and hasty"], syn:"cautious", ant:"reckless", sentence:"She was circumspect about sharing personal details online." },
  { word:"clandestine", def:"kept secret, often for an improper purpose", wrong:["open and public","loud and showy","honest and plain"], syn:"secret", ant:"open", sentence:"They held clandestine meetings to plan the escape." },
  { word:"coerce", def:"to force someone to do something by threat", wrong:["to gently persuade","to politely ask","to freely allow"], syn:"compel", ant:"persuade", sentence:"He was coerced into signing by threats." },
  { word:"complacent", def:"smugly self-satisfied and unconcerned", wrong:["anxious and driven","humble and modest","alert and worried"], syn:"smug", ant:"concerned", sentence:"After early success they grew complacent and stopped trying." },
  { word:"conciliatory", def:"intended to make peace or soothe", wrong:["meant to provoke","cold and hostile","proud and stubborn"], syn:"appeasing", ant:"antagonistic", sentence:"He made a conciliatory gesture to end the feud." },
  { word:"condescend", def:"to act superior; to talk down to others", wrong:["to treat as an equal","to admire deeply","to obey humbly"], syn:"patronize", ant:"respect", sentence:"She condescended to the new interns, mocking their questions." },
  { word:"convoluted", def:"extremely complex and hard to follow", wrong:["simple and clear","short and direct","plain and obvious"], syn:"complicated", ant:"straightforward", sentence:"The plot was so convoluted that no one could follow it." },
  { word:"corroborate", def:"to confirm or support with evidence", wrong:["to contradict flatly","to ignore entirely","to invent falsely"], syn:"confirm", ant:"contradict", sentence:"Two witnesses corroborated her account." },
  { word:"credulous", def:"too ready to believe things; gullible", wrong:["highly skeptical","very intelligent","extremely cautious"], syn:"gullible", ant:"skeptical", sentence:"The credulous buyer believed the obvious scam." },
  { word:"cynical", def:"distrustful of others' motives", wrong:["trusting and hopeful","cheerful and naive","warm and caring"], syn:"distrustful", ant:"trusting", sentence:"He had a cynical view that everyone acts out of self-interest." },
  { word:"dauntless", def:"fearless and determined", wrong:["easily frightened","weak and timid","lazy and slow"], syn:"fearless", ant:"timid", sentence:"The dauntless explorer pressed on through the storm." },
  { word:"debase", def:"to lower in quality, value, or dignity", wrong:["to raise in value","to praise highly","to purify fully"], syn:"degrade", ant:"elevate", sentence:"Printing too much money can debase the currency." },
  { word:"decorum", def:"proper, dignified behavior", wrong:["rude disorder","wild chaos","silly nonsense"], syn:"propriety", ant:"impropriety", sentence:"The judge demanded decorum in the courtroom." },
  { word:"deference", def:"respectful submission to another's wishes", wrong:["open defiance","cold contempt","loud rebellion"], syn:"respect", ant:"defiance", sentence:"Out of deference to her elders, she stayed silent." },
  { word:"delineate", def:"to describe or outline precisely", wrong:["to blur completely","to hide carefully","to destroy fully"], syn:"outline", ant:"obscure", sentence:"The report clearly delineates each step of the plan." },
  { word:"demagogue", def:"a leader who exploits prejudice and emotion", wrong:["a fair and honest judge","a quiet scholar","a humble servant"], syn:"agitator", ant:"statesman", sentence:"The demagogue stirred up the crowd with angry lies." },
  { word:"deprecate", def:"to express disapproval of; to belittle", wrong:["to praise warmly","to strongly support","to admire greatly"], syn:"belittle", ant:"praise", sentence:"He tended to deprecate his own achievements." },
  { word:"deride", def:"to mock or ridicule", wrong:["to praise sincerely","to encourage kindly","to respect deeply"], syn:"mock", ant:"praise", sentence:"Critics derided the film as a cheap imitation." },
  { word:"desiccate", def:"to dry out completely", wrong:["to soak with water","to freeze solid","to heat gently"], syn:"dehydrate", ant:"moisten", sentence:"The hot sun desiccated the once-green fields." },
  { word:"deter", def:"to discourage from acting, usually by fear", wrong:["to encourage strongly","to force forward","to allow freely"], syn:"discourage", ant:"encourage", sentence:"High fines deter people from littering." },
  { word:"diligent", def:"hardworking and careful", wrong:["lazy and careless","quick to quit","easily bored"], syn:"industrious", ant:"lazy", sentence:"A diligent student, she never missed an assignment." },
  { word:"discern", def:"to perceive or recognize clearly", wrong:["to overlook completely","to confuse badly","to forget quickly"], syn:"perceive", ant:"overlook", sentence:"It was hard to discern the truth from his many lies." },
  { word:"disdain", def:"contempt; a feeling that something is unworthy", wrong:["deep admiration","warm respect","eager interest"], syn:"contempt", ant:"admiration", sentence:"She looked at the cheap copy with disdain." },
  { word:"disparate", def:"fundamentally different; not comparable", wrong:["nearly identical","closely matched","perfectly equal"], syn:"dissimilar", ant:"similar", sentence:"The committee had to unite disparate opinions." },
  { word:"dissemble", def:"to hide one's true feelings or motives", wrong:["to reveal openly","to state plainly","to confess fully"], syn:"conceal", ant:"reveal", sentence:"He dissembled his anger behind a polite smile." },
  { word:"diverge", def:"to separate and go in different directions", wrong:["to come together","to stay parallel","to merge fully"], syn:"separate", ant:"converge", sentence:"The two paths diverge at the old oak tree." },
  { word:"dogmatic", def:"asserting opinions as if they were certain facts", wrong:["open-minded and flexible","doubtful and unsure","quiet and humble"], syn:"opinionated", ant:"open-minded", sentence:"He was too dogmatic to consider any other view." },
  { word:"duplicity", def:"deceitfulness; double-dealing", wrong:["complete honesty","open sincerity","blunt frankness"], syn:"deceit", ant:"honesty", sentence:"Her duplicity was exposed when both lies surfaced." },
  { word:"ebullient", def:"cheerful and full of energy", wrong:["gloomy and tired","cold and silent","bored and flat"], syn:"exuberant", ant:"gloomy", sentence:"The ebullient host greeted every guest with a laugh." },
  { word:"eccentric", def:"unconventional and slightly strange", wrong:["completely ordinary","strictly conventional","dull and typical"], syn:"quirky", ant:"conventional", sentence:"The eccentric inventor wore mismatched shoes on purpose." },
  { word:"effusive", def:"expressing emotion in an unrestrained way", wrong:["cold and reserved","silent and shy","calm and measured"], syn:"gushing", ant:"reserved", sentence:"She was effusive in her thanks, hugging everyone twice." },
  { word:"egregious", def:"outstandingly bad; shocking", wrong:["wonderfully good","barely noticeable","perfectly normal"], syn:"flagrant", ant:"admirable", sentence:"The referee made an egregious error that cost the game." },
  { word:"elusive", def:"hard to find, catch, or describe", wrong:["easy to grasp","plainly visible","quickly caught"], syn:"evasive", ant:"accessible", sentence:"Success remained elusive despite all his efforts." },
  { word:"emulate", def:"to imitate in order to match or surpass", wrong:["to ignore fully","to mock openly","to avoid carefully"], syn:"imitate", ant:"ignore", sentence:"Young players try to emulate their sports heroes." },
  { word:"enervate", def:"to drain of energy; to weaken", wrong:["to energize greatly","to strengthen fully","to excite wildly"], syn:"weaken", ant:"invigorate", sentence:"The brutal heat enervated the marchers." },
  { word:"enigmatic", def:"mysterious and difficult to understand", wrong:["plain and obvious","loud and clear","simple and open"], syn:"mysterious", ant:"clear", sentence:"She gave an enigmatic smile that revealed nothing." },
  { word:"erudite", def:"having or showing great learning", wrong:["ignorant and unread","silly and shallow","lazy and dull"], syn:"scholarly", ant:"ignorant", sentence:"The erudite professor quoted texts from memory." },
  { word:"esoteric", def:"understood by only a small, specialized group", wrong:["widely known","plain and simple","common and basic"], syn:"obscure", ant:"mainstream", sentence:"His esoteric hobby of medieval coin study baffled friends." },
  { word:"exacerbate", def:"to make a problem worse", wrong:["to ease greatly","to solve fully","to soothe gently"], syn:"worsen", ant:"alleviate", sentence:"Scratching only exacerbates the itch." },
  { word:"exhaustive", def:"thorough and complete; leaving nothing out", wrong:["quick and partial","careless and brief","narrow and shallow"], syn:"thorough", ant:"superficial", sentence:"They conducted an exhaustive search of the area." },
  { word:"expedient", def:"convenient and practical, though sometimes improper", wrong:["principled and noble","slow and clumsy","useless and vain"], syn:"convenient", ant:"inexpedient", sentence:"Lying seemed expedient, but it was wrong." },
  { word:"explicit", def:"stated clearly and in detail; leaving no doubt", wrong:["vague and implied","hidden and secret","confused and unclear"], syn:"clear", ant:"implicit", sentence:"She gave explicit instructions for the experiment." },
  { word:"extol", def:"to praise highly", wrong:["to criticize harshly","to ignore coldly","to mock cruelly"], syn:"praise", ant:"criticize", sentence:"Reviewers extolled the novel as a masterpiece." },
  { word:"extraneous", def:"irrelevant or unrelated to the matter", wrong:["essential and central","tightly relevant","deeply important"], syn:"irrelevant", ant:"relevant", sentence:"Cut the extraneous details and get to the point." },
  { word:"facilitate", def:"to make a process easier", wrong:["to block completely","to slow greatly","to complicate badly"], syn:"ease", ant:"hinder", sentence:"A good teacher facilitates learning." },
  { word:"fallacious", def:"based on mistaken belief or false reasoning", wrong:["perfectly logical","clearly true","carefully proven"], syn:"false", ant:"valid", sentence:"His argument rested on a fallacious assumption." },
  { word:"fastidious", def:"very attentive to detail; hard to please", wrong:["sloppy and lax","easygoing and loose","careless and messy"], syn:"meticulous", ant:"careless", sentence:"He was fastidious about keeping his desk spotless." },
  { word:"fervent", def:"showing intense, passionate feeling", wrong:["cold and indifferent","mild and lukewarm","bored and flat"], syn:"passionate", ant:"apathetic", sentence:"She made a fervent plea for help." },
  { word:"flagrant", def:"shockingly obvious and wrong", wrong:["subtle and hidden","minor and harmless","quiet and unseen"], syn:"blatant", ant:"subtle", sentence:"That was a flagrant violation of the rules." },
  { word:"flippant", def:"not showing proper seriousness; glib", wrong:["grave and earnest","deeply sincere","quiet and solemn"], syn:"glib", ant:"serious", sentence:"His flippant joke at the funeral offended many." },
  { word:"foreboding", def:"a feeling that something bad will happen", wrong:["a sense of safety","a joyful hope","a calm certainty"], syn:"dread", ant:"reassurance", sentence:"A sense of foreboding filled the silent house." },
  { word:"forthright", def:"direct and honest in manner", wrong:["evasive and sly","shy and silent","vague and unclear"], syn:"frank", ant:"evasive", sentence:"She was forthright about her concerns." },
  { word:"frugal", def:"careful with money; thrifty", wrong:["wildly wasteful","extremely greedy","carelessly generous"], syn:"thrifty", ant:"wasteful", sentence:"Being frugal, he saved half of every paycheck." },
  { word:"garrulous", def:"excessively talkative about trivial things", wrong:["silent and reserved","brief and curt","shy and quiet"], syn:"talkative", ant:"taciturn", sentence:"The garrulous neighbor talked for an hour about nothing." },
  { word:"gregarious", def:"fond of company; sociable", wrong:["solitary and shy","cold and distant","hostile and rude"], syn:"sociable", ant:"reclusive", sentence:"Her gregarious nature made her the life of the party." },
  { word:"guile", def:"sly cunning used to deceive", wrong:["open honesty","plain innocence","blunt sincerity"], syn:"cunning", ant:"honesty", sentence:"He won the game through guile rather than skill." },
  { word:"hackneyed", def:"overused and therefore unoriginal", wrong:["fresh and novel","rare and surprising","deep and original"], syn:"cliched", ant:"original", sentence:"The speech was full of hackneyed phrases." },
  { word:"haughty", def:"arrogantly superior and disdainful", wrong:["humble and modest","warm and friendly","shy and meek"], syn:"arrogant", ant:"humble", sentence:"She gave a haughty look and walked past without a word." },
  { word:"hegemony", def:"dominance of one group over others", wrong:["equal partnership","total weakness","peaceful balance"], syn:"dominance", ant:"subordination", sentence:"The empire's hegemony stretched across three continents." },
  { word:"heretical", def:"holding beliefs that go against accepted doctrine", wrong:["strictly orthodox","widely accepted","fully approved"], syn:"unorthodox", ant:"orthodox", sentence:"His heretical ideas got him expelled from the society." },
  { word:"hypocritical", def:"claiming morals one does not actually hold", wrong:["sincerely honest","truly virtuous","plainly genuine"], syn:"insincere", ant:"sincere", sentence:"It's hypocritical to preach honesty while lying." },
  { word:"iconoclast", def:"one who attacks cherished beliefs or institutions", wrong:["a loyal traditionalist","a humble follower","a quiet conformist"], syn:"rebel", ant:"conformist", sentence:"The iconoclast challenged every rule the academy held dear." },
  { word:"idiosyncratic", def:"peculiar to an individual; distinctive", wrong:["totally typical","widely shared","perfectly standard"], syn:"peculiar", ant:"conventional", sentence:"Her idiosyncratic style mixed plaids with polka dots." },
  { word:"impetuous", def:"acting quickly without thought; impulsive", wrong:["careful and cautious","slow and deliberate","calm and patient"], syn:"impulsive", ant:"cautious", sentence:"His impetuous decision to quit surprised everyone." },
  { word:"implacable", def:"unable to be appeased or calmed", wrong:["easily satisfied","gentle and forgiving","quick to relent"], syn:"relentless", ant:"appeasable", sentence:"She was an implacable enemy who never forgave." },
  { word:"implicit", def:"implied though not directly stated", wrong:["clearly spelled out","loudly announced","plainly written"], syn:"implied", ant:"explicit", sentence:"There was an implicit warning in his tone." },
  { word:"incoherent", def:"not logical or clearly connected", wrong:["clear and logical","neatly organized","smoothly flowing"], syn:"disjointed", ant:"coherent", sentence:"His fever made his speech incoherent." },
  { word:"indifferent", def:"having no interest or concern", wrong:["deeply passionate","strongly caring","highly curious"], syn:"unconcerned", ant:"interested", sentence:"He was indifferent to the outcome of the match." },
  { word:"indignant", def:"angry at unfair or wrong treatment", wrong:["calmly pleased","quietly content","mildly amused"], syn:"resentful", ant:"content", sentence:"She was indignant at being blamed unfairly." },
  { word:"indolent", def:"lazy; avoiding activity", wrong:["energetic and busy","quick and eager","hardworking and brisk"], syn:"lazy", ant:"industrious", sentence:"The indolent cat slept all afternoon." },
  { word:"ineffable", def:"too great to be expressed in words", wrong:["easily described","plain and ordinary","loud and clear"], syn:"indescribable", ant:"expressible", sentence:"She felt an ineffable joy at the summit." },
  { word:"inexorable", def:"impossible to stop or prevent", wrong:["easily halted","gentle and yielding","quickly reversed"], syn:"unstoppable", ant:"stoppable", sentence:"The inexorable march of time spares no one." },
  { word:"ingenuous", def:"innocent and unsuspecting; sincere", wrong:["sly and scheming","cold and guarded","cruel and harsh"], syn:"naive", ant:"cunning", sentence:"Her ingenuous trust made her easy to fool." },
  { word:"inimical", def:"tending to obstruct or harm; hostile", wrong:["helpful and friendly","warm and kind","supportive and caring"], syn:"hostile", ant:"favorable", sentence:"The climate was inimical to growing crops." },
  { word:"insipid", def:"lacking flavor or interest; dull", wrong:["rich and flavorful","exciting and bold","sharp and vivid"], syn:"bland", ant:"flavorful", sentence:"The soup was watery and insipid." },
  { word:"intransigent", def:"refusing to change one's views; stubborn", wrong:["flexible and yielding","easygoing and open","quick to compromise"], syn:"uncompromising", ant:"flexible", sentence:"Both sides were too intransigent to reach a deal." },
  { word:"inveterate", def:"firmly established by long habit", wrong:["new and occasional","brief and passing","rare and slight"], syn:"habitual", ant:"occasional", sentence:"He was an inveterate gambler who bet daily." },
  { word:"irascible", def:"easily angered; hot-tempered", wrong:["calm and patient","gentle and mild","cheerful and easygoing"], syn:"irritable", ant:"easygoing", sentence:"The irascible old man yelled at the kids to leave." },
  { word:"laconic", def:"using very few words", wrong:["long-winded and wordy","loud and dramatic","warm and chatty"], syn:"terse", ant:"verbose", sentence:"His laconic 'Fine' ended the conversation." },
  { word:"laudable", def:"deserving praise", wrong:["worthy of blame","utterly shameful","completely worthless"], syn:"praiseworthy", ant:"blameworthy", sentence:"Her efforts to help the poor were laudable." },
  { word:"lethargic", def:"sluggish and lacking energy", wrong:["lively and alert","quick and active","bright and eager"], syn:"sluggish", ant:"energetic", sentence:"The heat left everyone feeling lethargic." },
  { word:"lucid", def:"clear and easy to understand; rational", wrong:["confused and murky","vague and tangled","dim and unclear"], syn:"clear", ant:"confusing", sentence:"She gave a lucid explanation of the theory." },
  { word:"malleable", def:"easily shaped or influenced", wrong:["rigid and fixed","hard and brittle","stubborn and set"], syn:"pliable", ant:"rigid", sentence:"Gold is soft and malleable." },
  { word:"mendacious", def:"untruthful; lying", wrong:["honest and truthful","blunt and frank","sincere and open"], syn:"dishonest", ant:"truthful", sentence:"The mendacious witness invented the whole story." },
  { word:"mercurial", def:"prone to sudden, unpredictable mood changes", wrong:["steady and even","calm and constant","slow and stable"], syn:"volatile", ant:"stable", sentence:"His mercurial temper made him hard to work with." },
  { word:"misanthrope", def:"a person who dislikes humankind", wrong:["a lover of people","a generous host","a loyal friend"], syn:"cynic", ant:"philanthropist", sentence:"The misanthrope lived alone and avoided everyone." },
  { word:"mitigate", def:"to make less severe or painful", wrong:["to make far worse","to ignore fully","to intensify greatly"], syn:"alleviate", ant:"aggravate", sentence:"Sandbags helped mitigate the flood damage." },
  { word:"mundane", def:"dull, ordinary, and everyday", wrong:["rare and exciting","sacred and grand","strange and magical"], syn:"ordinary", ant:"extraordinary", sentence:"She longed to escape her mundane routine." },
  { word:"nefarious", def:"wicked or criminal", wrong:["noble and good","kind and gentle","honest and fair"], syn:"villainous", ant:"virtuous", sentence:"The villain hatched a nefarious plot." },
  { word:"nonchalant", def:"calmly casual; unconcerned", wrong:["anxious and tense","excited and frantic","worried and nervous"], syn:"casual", ant:"anxious", sentence:"He gave a nonchalant shrug at the bad news." },
  { word:"obdurate", def:"stubbornly refusing to change", wrong:["easily persuaded","soft and yielding","quick to agree"], syn:"stubborn", ant:"yielding", sentence:"The obdurate judge would not reduce the sentence." },
  { word:"oblique", def:"indirect or evasive; slanting", wrong:["direct and straight","plain and open","blunt and clear"], syn:"indirect", ant:"direct", sentence:"He made an oblique reference to her past." },
  { word:"obscure", def:"not clearly known or understood; hidden", wrong:["famous and clear","bright and obvious","widely known"], syn:"unclear", ant:"obvious", sentence:"The poem's meaning remained obscure." },
  { word:"obstinate", def:"stubbornly refusing to change one's mind", wrong:["flexible and open","gentle and yielding","quick to compromise"], syn:"stubborn", ant:"compliant", sentence:"The obstinate child refused to eat his vegetables." },
  { word:"obtuse", def:"slow to understand; dull", wrong:["sharp and quick","keenly perceptive","highly clever"], syn:"dense", ant:"perceptive", sentence:"He was too obtuse to take the hint." },
  { word:"ominous", def:"suggesting that something bad will happen", wrong:["promising good luck","calm and pleasant","bright and cheerful"], syn:"threatening", ant:"auspicious", sentence:"The ominous clouds warned of a coming storm." },
  { word:"onerous", def:"involving a heavy burden; troublesome", wrong:["light and easy","fun and simple","quick and pleasant"], syn:"burdensome", ant:"easy", sentence:"The new rules placed an onerous load on small shops." },
  { word:"opaque", def:"not able to be seen through; hard to understand", wrong:["clear and see-through","bright and obvious","simple and plain"], syn:"impenetrable", ant:"transparent", sentence:"The frosted glass was completely opaque." },
  { word:"opulent", def:"rich and luxurious", wrong:["poor and bare","plain and simple","cheap and shabby"], syn:"luxurious", ant:"austere", sentence:"They dined in an opulent hall of gold and crystal." },
  { word:"orthodox", def:"following accepted or traditional beliefs", wrong:["rebellious and new","strange and radical","heretical and odd"], syn:"conventional", ant:"unorthodox", sentence:"He held orthodox views on the subject." },
  { word:"paramount", def:"more important than anything else; supreme", wrong:["trivial and minor","equal to others","last in rank"], syn:"supreme", ant:"trivial", sentence:"Safety is of paramount importance here." },
  { word:"parsimonious", def:"extremely unwilling to spend; stingy", wrong:["lavishly generous","carelessly wasteful","freely giving"], syn:"stingy", ant:"generous", sentence:"His parsimonious habits meant he reused tea bags." },
  { word:"patronize", def:"to treat in a condescending way", wrong:["to treat as an equal","to admire openly","to obey humbly"], syn:"condescend", ant:"respect", sentence:"Don't patronize me by explaining what I already know." },
  { word:"pedantic", def:"overly concerned with minor details or rules", wrong:["loose and easygoing","broad and flexible","careless and vague"], syn:"nitpicking", ant:"easygoing", sentence:"His pedantic corrections annoyed the whole class." },
  { word:"pensive", def:"deeply or seriously thoughtful", wrong:["carefree and giddy","loud and lively","empty-headed"], syn:"reflective", ant:"carefree", sentence:"She sat by the window in a pensive mood." },
  { word:"perfunctory", def:"done with little care or interest; routine", wrong:["careful and heartfelt","thorough and devoted","eager and warm"], syn:"cursory", ant:"thorough", sentence:"He gave a perfunctory nod and walked off." },
  { word:"placate", def:"to soothe or calm an angry person", wrong:["to enrage further","to ignore coldly","to provoke openly"], syn:"appease", ant:"provoke", sentence:"She tried to placate the upset customer with a refund." },
  { word:"plausible", def:"seeming reasonable or probable", wrong:["clearly impossible","obviously false","totally absurd"], syn:"believable", ant:"implausible", sentence:"He gave a plausible excuse for being late." },
  { word:"polarize", def:"to divide into sharply opposing groups", wrong:["to unite fully","to blend smoothly","to calm gently"], syn:"divide", ant:"unite", sentence:"The issue polarized the town into two camps." },
  { word:"pompous", def:"arrogant and self-important", wrong:["humble and modest","shy and quiet","warm and simple"], syn:"arrogant", ant:"humble", sentence:"The pompous official loved hearing himself talk." },
  { word:"precarious", def:"dangerously unstable or insecure", wrong:["safe and steady","firmly secure","solid and stable"], syn:"unstable", ant:"secure", sentence:"The ladder was in a precarious position." },
  { word:"pretentious", def:"trying to seem more important than one is", wrong:["modest and plain","honest and simple","humble and real"], syn:"affected", ant:"unpretentious", sentence:"The pretentious menu used fancy words for plain food." },
  { word:"prevalent", def:"widespread; common in a place or time", wrong:["rare and unusual","gone and extinct","hidden and secret"], syn:"widespread", ant:"rare", sentence:"The belief was prevalent in the Middle Ages." },
  { word:"prodigal", def:"wastefully extravagant", wrong:["careful and thrifty","stingy and mean","modest and saving"], syn:"wasteful", ant:"frugal", sentence:"His prodigal spending soon emptied the fortune." },
  { word:"profound", def:"very deep, intense, or insightful", wrong:["shallow and trivial","light and silly","plain and simple"], syn:"deep", ant:"superficial", sentence:"Her words had a profound effect on him." },
  { word:"prolific", def:"producing much; highly productive", wrong:["barren and unproductive","slow and rare","empty and idle"], syn:"productive", ant:"unproductive", sentence:"The prolific author wrote three books a year." },
  { word:"propitious", def:"giving a good chance of success; favorable", wrong:["unlucky and grim","threatening harm","sad and bleak"], syn:"favorable", ant:"unfavorable", sentence:"Conditions were propitious for setting sail." },
  { word:"provincial", def:"narrow in outlook; unsophisticated", wrong:["worldly and broad","refined and urbane","open-minded"], syn:"narrow-minded", ant:"cosmopolitan", sentence:"His provincial views ignored the wider world." },
  { word:"prudent", def:"acting with care and good judgment", wrong:["reckless and rash","foolish and hasty","careless and wild"], syn:"cautious", ant:"reckless", sentence:"It is prudent to save for emergencies." },
  { word:"querulous", def:"complaining in a whining manner", wrong:["cheerful and content","calm and grateful","quiet and pleased"], syn:"whiny", ant:"content", sentence:"The querulous patient complained about everything." },
  { word:"rancorous", def:"full of bitter, long-lasting resentment", wrong:["warm and friendly","calm and forgiving","sweet and kind"], syn:"bitter", ant:"amicable", sentence:"The rancorous dispute split the family for years." },
  { word:"recalcitrant", def:"stubbornly resisting authority", wrong:["obedient and meek","willing and eager","calm and compliant"], syn:"defiant", ant:"obedient", sentence:"The recalcitrant student ignored every rule." },
  { word:"reclusive", def:"avoiding the company of others", wrong:["sociable and outgoing","loud and friendly","eager for company"], syn:"solitary", ant:"gregarious", sentence:"The reclusive writer hadn't been seen in years." },
  { word:"rectify", def:"to put right; to correct", wrong:["to make worse","to ignore fully","to ruin badly"], syn:"correct", ant:"worsen", sentence:"They acted quickly to rectify the mistake." },
  { word:"redress", def:"to set right; to remedy a wrong", wrong:["to cause harm","to overlook entirely","to worsen greatly"], syn:"remedy", ant:"aggravate", sentence:"The court sought to redress the injustice." },
  { word:"refute", def:"to prove a statement to be wrong", wrong:["to prove true","to fully accept","to strongly support"], syn:"disprove", ant:"confirm", sentence:"New data refuted the old theory." },
  { word:"repudiate", def:"to reject or disown", wrong:["to embrace warmly","to accept fully","to claim proudly"], syn:"reject", ant:"embrace", sentence:"He repudiated the views he once held." },
  { word:"resilient", def:"able to recover quickly from difficulty", wrong:["easily broken","weak and fragile","quick to give up"], syn:"tough", ant:"fragile", sentence:"Children are often remarkably resilient." },
  { word:"reticent", def:"not revealing one's thoughts readily; reserved", wrong:["talkative and open","loud and frank","eager to share"], syn:"reserved", ant:"forthcoming", sentence:"He was reticent about his private life." },
  { word:"reverent", def:"showing deep respect", wrong:["mocking and rude","cold and scornful","careless and flippant"], syn:"respectful", ant:"irreverent", sentence:"They fell silent in reverent awe of the cathedral." },
  { word:"rhetoric", def:"the art of persuasive speaking or writing", wrong:["plain silence","random noise","strict mathematics"], syn:"oratory", ant:"plainspeak", sentence:"His speech was full of stirring rhetoric." },
  { word:"rudimentary", def:"basic; at an early stage of development", wrong:["advanced and complex","polished and refined","fully developed"], syn:"basic", ant:"advanced", sentence:"She had only a rudimentary grasp of French." },
  { word:"sagacious", def:"having keen judgment; wise", wrong:["foolish and rash","dull and slow","naive and silly"], syn:"wise", ant:"foolish", sentence:"The sagacious leader foresaw the crisis." },
  { word:"sanctimonious", def:"making a show of being morally superior", wrong:["humble and genuine","honest and plain","modest and quiet"], syn:"self-righteous", ant:"humble", sentence:"His sanctimonious lectures grated on everyone." },
  { word:"sardonic", def:"grimly mocking or scornful", wrong:["warm and sincere","cheerful and kind","gentle and earnest"], syn:"mocking", ant:"genial", sentence:"She gave a sardonic laugh at his excuse." },
  { word:"scrupulous", def:"very careful to do what is right and exact", wrong:["careless and dishonest","sloppy and vague","reckless and loose"], syn:"conscientious", ant:"unscrupulous", sentence:"He kept scrupulous records of every expense." },
  { word:"sedulous", def:"showing dedicated, diligent effort", wrong:["lazy and idle","careless and brief","quick to quit"], syn:"diligent", ant:"idle", sentence:"Her sedulous practice made her a master." },
  { word:"skeptical", def:"inclined to doubt or question", wrong:["easily convinced","fully trusting","blindly certain"], syn:"doubtful", ant:"credulous", sentence:"Scientists were skeptical of the bold claim." },
  { word:"slander", def:"a false spoken statement that damages reputation", wrong:["honest praise","fair criticism","public apology"], syn:"defamation", ant:"praise", sentence:"She sued him for slander over the false rumor." },
  { word:"solemn", def:"formal and dignified; serious", wrong:["silly and playful","light and casual","loud and festive"], syn:"serious", ant:"frivolous", sentence:"They observed a solemn moment of silence." },
  { word:"sophisticated", def:"refined and worldly; highly complex", wrong:["crude and simple","naive and plain","rough and basic"], syn:"refined", ant:"crude", sentence:"The system used sophisticated encryption." },
  { word:"spurious", def:"false or fake; not genuine", wrong:["true and genuine","honest and real","authentic and valid"], syn:"fake", ant:"genuine", sentence:"The claim was based on spurious data." },
  { word:"stoic", def:"enduring hardship without showing feeling", wrong:["highly emotional","easily upset","openly dramatic"], syn:"unemotional", ant:"emotional", sentence:"He remained stoic despite the pain." },
  { word:"stymie", def:"to block or thwart", wrong:["to help along","to speed up","to clear the way"], syn:"thwart", ant:"assist", sentence:"Bad weather stymied the rescue effort." },
  { word:"subjugate", def:"to bring under control by force; to conquer", wrong:["to set free","to treat as an equal","to lift up"], syn:"conquer", ant:"liberate", sentence:"The empire subjugated the smaller nations." },
  { word:"superficial", def:"shallow; concerned only with the surface", wrong:["deep and profound","thorough and complete","serious and weighty"], syn:"shallow", ant:"profound", sentence:"His knowledge was superficial, just a few buzzwords." },
  { word:"superfluous", def:"more than is needed; unnecessary", wrong:["essential and needed","scarce and rare","central and vital"], syn:"unnecessary", ant:"essential", sentence:"Cut any superfluous words from the essay." },
  { word:"taciturn", def:"reserved; saying little", wrong:["chatty and open","loud and lively","warm and talkative"], syn:"reserved", ant:"talkative", sentence:"The taciturn farmer answered only with nods." },
  { word:"tenacious", def:"holding firmly; persistent", wrong:["weak and yielding","quick to quit","loose and slack"], syn:"persistent", ant:"yielding", sentence:"Her tenacious grip would not let go." },
  { word:"tentative", def:"not certain; done as a trial", wrong:["firm and final","bold and sure","fixed and settled"], syn:"provisional", ant:"definite", sentence:"They made a tentative plan to meet next week." },
  { word:"timid", def:"lacking courage; shy", wrong:["bold and brave","loud and pushy","fierce and daring"], syn:"shy", ant:"bold", sentence:"The timid puppy hid behind the couch." },
  { word:"torpid", def:"sluggish; lacking energy or motion", wrong:["lively and active","quick and alert","bright and brisk"], syn:"sluggish", ant:"active", sentence:"The torpid lizard lay still in the cold." },
  { word:"tractable", def:"easy to control or manage", wrong:["stubborn and wild","unruly and defiant","hard to handle"], syn:"manageable", ant:"unruly", sentence:"The trainer found the horse tractable and calm." },
  { word:"transient", def:"lasting only a short time", wrong:["lasting forever","fixed and permanent","slow and steady"], syn:"fleeting", ant:"permanent", sentence:"Fame can be transient, fading within months." },
  { word:"trivial", def:"of little value or importance", wrong:["vitally important","huge and serious","deeply meaningful"], syn:"unimportant", ant:"significant", sentence:"Don't waste time on trivial matters." },
  { word:"turbulent", def:"full of disorder, conflict, or violent motion", wrong:["calm and peaceful","smooth and steady","still and quiet"], syn:"chaotic", ant:"calm", sentence:"They lived through turbulent political times." },
  { word:"ubiquitous", def:"present everywhere at once", wrong:["extremely rare","hidden away","found in one place"], syn:"omnipresent", ant:"scarce", sentence:"Smartphones are now ubiquitous." },
  { word:"unequivocal", def:"leaving no doubt; absolutely clear", wrong:["vague and unclear","open to debate","doubtful and mixed"], syn:"unambiguous", ant:"ambiguous", sentence:"She gave an unequivocal 'no.'" },
  { word:"vacuous", def:"empty of thought or meaning", wrong:["deep and thoughtful","full of insight","rich in meaning"], syn:"empty", ant:"profound", sentence:"He gave a vacuous stare and said nothing." },
  { word:"verbose", def:"using more words than needed", wrong:["brief and concise","silent and terse","short and sharp"], syn:"wordy", ant:"concise", sentence:"The verbose report could have been one page." },
  { word:"vindictive", def:"seeking revenge; spiteful", wrong:["forgiving and kind","calm and merciful","generous and warm"], syn:"vengeful", ant:"forgiving", sentence:"Out of spite, she made a vindictive remark." },
  { word:"volatile", def:"liable to change rapidly and unpredictably", wrong:["stable and steady","calm and constant","slow and fixed"], syn:"unstable", ant:"stable", sentence:"The stock market was volatile all week." },
  { word:"wary", def:"cautious about possible danger", wrong:["careless and trusting","bold and reckless","calm and unguarded"], syn:"cautious", ant:"unwary", sentence:"Be wary of deals that seem too good to be true." },
  { word:"zealous", def:"filled with intense enthusiasm", wrong:["bored and indifferent","cold and uncaring","lazy and slack"], syn:"fervent", ant:"apathetic", sentence:"The zealous volunteers worked through the night." }
];

/* ===================================================================
   2. GAME CONSTANTS & STATE
   =================================================================== */
const TOTAL_PLAYERS   = 100;
const TIME_LIMIT      = 15;            // seconds per question
const QUESTION_TYPES  = ['definition', 'synonym', 'antonym', 'fillblank', 'context'];

// AI accuracy by skill tier — probability of answering correctly.
const SKILL = {
  easy:   { acc: 0.45, label: 'easy' },
  medium: { acc: 0.68, label: 'medium' },
  hard:   { acc: 0.86, label: 'hard' }
};

// Difficulty affects how much HP the human loses per wrong answer.
const DIFFICULTY = {
  easy:   { humanDmg: 16, label: 'easy' },
  normal: { humanDmg: 22, label: 'normal' },
  hard:   { humanDmg: 30, label: 'hard' }
};

const state = {
  players: [],          // ALL players (human + AI) — single source of truth
  humanPlayer: null,    // separate handle to the local player object
  round: 0,
  currentQuestion: null,
  timer: null,
  timeLeft: TIME_LIMIT,
  answered: false,
  difficulty: 'normal',
  wordQueue: [],        // shuffled vocab indices, so words don't repeat too soon
  busy: false,
  active: false         // true while a match is in progress (guards stale timers)
};

/* ===================================================================
   3. DOM SHORTCUTS
   =================================================================== */
const $ = (id) => document.getElementById(id);
const els = {
  startScreen:  $('startScreen'),
  gameScreen:   $('gameScreen'),
  usernameInput:$('usernameInput'),
  startBtn:     $('startBtn'),
  difficultyPick:$('difficultyPick'),
  homeBtn:      $('homeBtn'),

  hudAvatar: $('hudAvatar'),
  hudName:   $('hudName'),
  hudAlive:  $('hudAlive'),
  hudRound:  $('hudRound'),
  hpFill:    $('hpFill'),
  hpText:    $('hpText'),
  hpWrap:    $('hpWrap'),
  scoreVal:  $('scoreVal'),
  streakVal: $('streakVal'),
  streakBox: $('streakBox'),
  streakFire:$('streakFire'),

  qType:    $('qType'),
  qPrompt:  $('qPrompt'),
  qContext: $('qContext'),
  answers:  $('answers'),
  timer:    $('timer'),
  timerNum: $('timerNum'),
  ringFg:   $('ringFg'),

  lbList:   $('lbList'),
  lbAlive:  $('lbAlive'),

  roundOverlay: $('roundOverlay'),
  ovRound:   $('ovRound'),
  ovElim:    $('ovElim'),
  ovRemain:  $('ovRemain'),
  ovCountdown:$('ovCountdown'),

  victoryScreen: $('victoryScreen'),
  vicScore:  $('vicScore'),
  vicRounds: $('vicRounds'),
  vicStreak: $('vicStreak'),
  playAgainBtn: $('playAgainBtn'),

  defeatScreen: $('defeatScreen'),
  defeatText:$('defeatText'),
  defScore:  $('defScore'),
  defRank:   $('defRank'),
  defStreak: $('defStreak'),
  tryAgainBtn: $('tryAgainBtn'),

  edgeFlash:   $('edgeFlash'),
  particleHost:$('particleHost'),
  fxLayer:     $('fxLayer')
};

const RING_CIRC = 2 * Math.PI * 54; // matches r=54 in the SVG

/* ===================================================================
   4. UTILITY HELPERS
   =================================================================== */
const rand    = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick    = (arr) => arr[Math.floor(Math.random() * arr.length)];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Capitalize first letter (for display of words / synonyms).
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Gamer-style random usernames for AI opponents.
const NAME_A = ['Shadow','Crimson','Neon','Frost','Vortex','Iron','Cyber','Ghost','Turbo','Hyper','Lunar','Solar','Toxic','Rapid','Mega','Pixel','Quantum','Nova','Blaze','Storm','Echo','Vivid','Apex','Zen','Cosmic','Rogue','Savage','Epic','Wild','Prime'];
const NAME_B = ['Wolf','Hawk','Viper','Reaper','Sniper','Ninja','Phoenix','Dragon','Knight','Lexicon','Scholar','Sage','Mind','Brain','Wizard','Master','Slayer','Hunter','Raptor','Titan','Fox','Cobra','Falcon','Specter','Blade','Beast','Oracle','Champ','Genius','Maverick'];

function makeName() {
  return pick(NAME_A) + pick(NAME_B) + (Math.random() < 0.6 ? randInt(1, 99) : '');
}

/* ===================================================================
   5. PLAYER / GAME SETUP
   =================================================================== */
function initPlayers(username) {
  state.players = [];

  // ---- The human player (also lives inside the players[] array) ----
  // SUPABASE: on connect, INSERT this row into a `players` table and
  //           subscribe to the realtime channel for this match.
  const human = {
    id: 'you',
    name: username,
    score: 0,
    streak: 0,
    bestStreak: 0,
    hp: 100,
    alive: true,
    isHuman: true,
    skill: 'human',
    eliminatedRound: null
  };
  state.humanPlayer = human;          // separate handle, same object reference
  state.players.push(human);

  // ---- 99 AI opponents ----
  // SUPABASE: in real multiplayer these would be other connected clients;
  //           here we simulate them locally.
  const usedNames = new Set([username.toLowerCase()]);
  for (let i = 0; i < TOTAL_PLAYERS - 1; i++) {
    let name = makeName();
    let guard = 0;
    while (usedNames.has(name.toLowerCase()) && guard++ < 20) name = makeName();
    usedNames.add(name.toLowerCase());

    // skill tiers roughly 35% easy / 40% medium / 25% hard
    const roll = Math.random();
    const skill = roll < 0.35 ? 'easy' : roll < 0.75 ? 'medium' : 'hard';

    state.players.push({
      id: 'ai_' + i,
      name,
      score: 0,
      streak: 0,
      bestStreak: 0,
      hp: 100,
      alive: true,
      isHuman: false,
      skill,
      eliminatedRound: null
    });
  }
}

function startGame() {
  const username = (els.usernameInput.value || '').trim() || 'You';
  state.round = 0;
  state.busy = false;
  state.active = true;

  initPlayers(username);

  // HUD identity
  els.hudName.textContent = username;
  els.hudAvatar.textContent = username.charAt(0).toUpperCase();

  // Build a long shuffled queue of word indices.
  state.wordQueue = shuffle(vocabDB.map((_, i) => i));

  els.startScreen.hidden = true;
  els.gameScreen.hidden = false;
  els.victoryScreen.hidden = true;
  els.defeatScreen.hidden = true;

  updateHUD();
  renderLeaderboard();

  // First round transition + countdown, then the first question.
  showRoundOverlay(0);
}

/* ===================================================================
   6. QUESTION GENERATION
   generateQuestion(word) builds a question object for the given entry.
   Rotates through all five question types based on the round number.
   =================================================================== */
function nextWordEntry() {
  if (state.wordQueue.length === 0) {
    state.wordQueue = shuffle(vocabDB.map((_, i) => i));
  }
  return vocabDB[state.wordQueue.pop()];
}

// Return n random entries other than `exclude`.
function randomOtherEntries(exclude, n) {
  const out = [];
  const used = new Set([exclude.word]);
  let guard = 0;
  while (out.length < n && guard++ < 500) {
    const e = pick(vocabDB);
    if (used.has(e.word)) continue;
    used.add(e.word);
    out.push(e);
  }
  return out;
}

function generateQuestion(entry, type) {
  let prompt, options, correct, context = null;

  switch (type) {
    case 'definition': {
      prompt = `Which answer best matches the meaning of <span class="hl">${cap(entry.word)}</span>?`;
      correct = entry.def;
      options = shuffle([entry.def, ...entry.wrong]);
      break;
    }
    case 'synonym': {
      prompt = `Which word is closest in meaning to <span class="hl">${cap(entry.word)}</span>?`;
      correct = entry.syn;
      const distractors = randomOtherEntries(entry, 3).map(e => e.word);
      options = shuffle([entry.syn, ...distractors]).map(cap);
      correct = cap(correct);
      break;
    }
    case 'antonym': {
      prompt = `Which word is most opposite in meaning to <span class="hl">${cap(entry.word)}</span>?`;
      correct = entry.ant;
      const distractors = randomOtherEntries(entry, 3).map(e => e.syn);
      options = shuffle([entry.ant, ...distractors]).map(cap);
      correct = cap(correct);
      break;
    }
    case 'fillblank': {
      // Blank out the word inside its example sentence.
      const blanked = entry.sentence.replace(
        new RegExp(entry.word, 'i'),
        '<span class="blank">______</span>'
      );
      prompt = `Choose the word that best completes the sentence:<br><em>${blanked}</em>`;
      correct = entry.word;
      const distractors = randomOtherEntries(entry, 3).map(e => e.word);
      options = shuffle([entry.word, ...distractors]).map(cap);
      correct = cap(correct);
      break;
    }
    case 'context':
    default: {
      // Show the word used in a sentence; ask for its meaning.
      const used = entry.sentence.replace(
        new RegExp('(' + entry.word + ')', 'i'),
        '<b>$1</b>'
      );
      context = used;
      prompt = `In the sentence above, what does <span class="hl">${cap(entry.word)}</span> mean?`;
      correct = entry.def;
      options = shuffle([entry.def, ...entry.wrong]);
      break;
    }
  }

  return {
    entry,
    type,
    prompt,
    context,
    options,
    correct,
    correctIndex: options.indexOf(correct)
  };
}

/* ===================================================================
   7. RENDER THE QUESTION
   =================================================================== */
function showQuestion() {
  if (!state.active) return; // player left the match
  const entry = nextWordEntry();
  const type  = QUESTION_TYPES[(state.round - 1) % QUESTION_TYPES.length];
  const q = generateQuestion(entry, type);
  state.currentQuestion = q;
  state.answered = false;
  updateHUD(); // keep the round label / alive count in sync with the new question

  // Type badge label
  const typeLabels = {
    definition: 'DEFINITION', synonym: 'SYNONYM', antonym: 'ANTONYM',
    fillblank: 'FILL IN THE BLANK', context: 'CONTEXT'
  };
  els.qType.textContent = typeLabels[type];

  // Context box (only for context questions)
  if (q.context) {
    els.qContext.hidden = false;
    els.qContext.innerHTML = q.context;
  } else {
    els.qContext.hidden = true;
  }

  els.qPrompt.innerHTML = q.prompt;

  // Build answer buttons A/B/C/D
  els.answers.classList.remove('locked');
  els.answers.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.dataset.index = i;
    btn.innerHTML = `<span class="badge">${letters[i]}</span><span class="txt">${opt}</span>`;
    btn.addEventListener('click', () => onAnswer(i, btn));
    els.answers.appendChild(btn);
  });

  startTimer();
}

/* ===================================================================
   8. CIRCULAR COUNTDOWN TIMER
   =================================================================== */
function startTimer() {
  clearInterval(state.timer);
  state.timeLeft = TIME_LIMIT;
  const start = performance.now();

  els.ringFg.style.strokeDasharray = RING_CIRC;
  els.ringFg.style.strokeDashoffset = 0;
  els.ringFg.classList.remove('mid', 'low');
  els.timer.classList.remove('urgent');
  els.timerNum.textContent = TIME_LIMIT;

  state.timer = setInterval(() => {
    const elapsed = (performance.now() - start) / 1000;
    const remaining = Math.max(0, TIME_LIMIT - elapsed);
    state.timeLeft = remaining;

    // Deplete the ring.
    els.ringFg.style.strokeDashoffset = RING_CIRC * (elapsed / TIME_LIMIT);
    els.timerNum.textContent = Math.ceil(remaining);

    // Color transitions green -> yellow -> red.
    els.ringFg.classList.toggle('mid', remaining <= 10 && remaining > 5);
    els.ringFg.classList.toggle('low', remaining <= 5);
    els.timer.classList.toggle('urgent', remaining <= 5);

    if (remaining <= 0) {
      clearInterval(state.timer);
      if (!state.answered) onAnswer(-1, null); // ran out of time = wrong
    }
  }, 50);
}

/* ===================================================================
   9. ANSWER HANDLING (human)
   =================================================================== */
function onAnswer(index, btn) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(state.timer);
  els.answers.classList.add('locked');

  const q = state.currentQuestion;
  const human = state.humanPlayer;
  const correct = index === q.correctIndex;
  const timeBonus = Math.round((state.timeLeft / TIME_LIMIT) * 100);

  // Reveal correct / wrong styling on the buttons.
  const btns = [...els.answers.children];
  btns.forEach((b, i) => {
    if (i === q.correctIndex) b.classList.add('correct');
    else if (i === index)     b.classList.add('wrong');
    else                      b.classList.add('faded');
  });

  // SUPABASE: broadcast {playerId:'you', answerIndex:index, time:timeBonus}
  //           to the match channel so other clients see your result.

  if (correct) {
    const streakBonus = human.streak * 10;
    const gained = 100 + timeBonus + streakBonus;
    human.score += gained;
    human.streak += 1;
    human.bestStreak = Math.max(human.bestStreak, human.streak);

    flashEdge('green');
    floatScore(`+${gained} ⚡`, 'good', btn);
    bumpStreak();
  } else {
    human.streak = 0;
    const dmg = DIFFICULTY[state.difficulty].humanDmg + Math.round(state.round * 1.5);
    human.hp = Math.max(0, human.hp - dmg);
    if (human.hp <= 0) human.alive = false;

    flashEdge('red');
    floatScore(`-${dmg} HP`, 'bad', btn);
    shakeHP();
  }

  updateHUD();

  // Let the human see the result, then resolve the round for everyone.
  setTimeout(resolveRound, 1300);
}

/* ===================================================================
   10. AI OPPONENTS — simulateAIAnswers()
   Each alive AI answers based on its skill accuracy. Correct answers
   score points; wrong answers take "storm" damage that scales with the
   round, guaranteeing the lobby thins out over time.
   =================================================================== */
function simulateAIAnswers() {
  // Storm damage grows each round so the match always converges.
  const stormDmg = 30 + Math.round(state.round * 2.2);
  let eliminatedThisRound = 0;

  state.players.forEach((p) => {
    if (p.isHuman || !p.alive) return;

    // SUPABASE: in real multiplayer, replace this simulation with the
    //           actual answers received from each remote player.
    const acc = SKILL[p.skill].acc;
    const correct = Math.random() < acc;

    if (correct) {
      const aiTimeBonus = randInt(20, 100);             // pretend answer speed
      const streakBonus = p.streak * 10;
      p.score += 100 + aiTimeBonus + streakBonus;
      p.streak += 1;
      p.bestStreak = Math.max(p.bestStreak, p.streak);
    } else {
      p.streak = 0;
      p.hp -= stormDmg;
      // Wrong answer = lose HP + chance of elimination once HP is gone,
      // plus a small random sudden-death chance to keep things moving.
      if (p.hp <= 0 || Math.random() < 0.08) {
        p.hp = 0;
        p.alive = false;
        p.eliminatedRound = state.round;
        eliminatedThisRound++;
      }
    }
  });

  return eliminatedThisRound;
}

/* ===================================================================
   11. RESOLVE ROUND -> check end -> next round
   =================================================================== */
function resolveRound() {
  if (!state.active) return; // player left the match
  let eliminated = simulateAIAnswers();

  // If the human just died this counts as an elimination too.
  const humanJustDied = !state.humanPlayer.alive && state.humanPlayer.eliminatedRound === null;
  if (humanJustDied) {
    state.humanPlayer.eliminatedRound = state.round;
  }

  renderLeaderboard();
  updateHUD();

  const aiAlive = state.players.filter(p => !p.isHuman && p.alive).length;

  // ---- End conditions ----
  if (!state.humanPlayer.alive) {
    setTimeout(() => showDefeat(), 700);
    return;
  }
  if (aiAlive === 0) {
    setTimeout(() => showVictory(), 700);
    return;
  }

  // Otherwise advance to the next round.
  showRoundOverlay(eliminated);
}

/* ===================================================================
   12. ROUND TRANSITION OVERLAY + 3-2-1 COUNTDOWN
   =================================================================== */
function showRoundOverlay(eliminatedCount) {
  const nextRound = state.round + 1;
  const remaining = state.players.filter(p => p.alive).length;

  els.ovRound.textContent = nextRound;
  els.ovElim.textContent = eliminatedCount;
  els.ovRemain.textContent = remaining;
  els.ovCountdown.innerHTML = '';

  els.roundOverlay.hidden = false;
  els.roundOverlay.classList.remove('show');
  void els.roundOverlay.offsetWidth; // restart animation
  els.roundOverlay.classList.add('show');

  // After showing the stats, run the countdown.
  const steps = ['3', '2', '1', 'GO'];
  let i = 0;
  const showStats = 1100;

  setTimeout(function tick() {
    if (!state.active) return; // player left during the countdown
    if (i >= steps.length) {
      // Countdown finished -> start the actual round.
      els.roundOverlay.hidden = true;
      state.round = nextRound;
      showQuestion();
      return;
    }
    const isGo = steps[i] === 'GO';
    els.ovCountdown.innerHTML = `<span class="cd ${isGo ? 'go' : ''}">${steps[i]}</span>`;
    i++;
    setTimeout(tick, isGo ? 600 : 800);
  }, showStats);
}

/* ===================================================================
   13. LEADERBOARD RENDER (with FLIP reorder animation)
   =================================================================== */
function sortPlayers() {
  // Alive players first (by score desc), then eliminated (by score desc).
  return state.players.slice().sort((a, b) => {
    if (a.alive !== b.alive) return a.alive ? -1 : 1;
    return b.score - a.score;
  });
}

function renderLeaderboard() {
  const list = els.lbList;

  // --- FLIP step 1: record current positions by id ---
  const oldTop = {};
  [...list.children].forEach(ch => {
    oldTop[ch.dataset.id] = ch.getBoundingClientRect().top;
  });

  const sorted = sortPlayers();
  const prevEliminated = new Set(
    [...list.children].filter(c => c.classList.contains('eliminated')).map(c => c.dataset.id)
  );
  const hadRows = list.children.length > 0;

  list.innerHTML = '';
  sorted.forEach((p, idx) => {
    const rank = idx + 1;
    const row = document.createElement('div');
    row.className = 'lb-row';
    row.dataset.id = p.id;
    if (p.isHuman) row.classList.add('you');
    if (p.alive && rank <= 3) row.classList.add('rank-' + rank);
    if (!p.alive) {
      row.classList.add('eliminated');
      // Flash players that were eliminated this render.
      if (hadRows && !prevEliminated.has(p.id)) row.classList.add('just-out');
    }

    const crown = (p.alive && rank === 1) ? '👑 ' :
                  (p.alive && rank === 2) ? '🥈 ' :
                  (p.alive && rank === 3) ? '🥉 ' : '';
    const crownSpan = crown ? `<span class="crown-ico">${crown.trim()}</span> ` : '';
    const statusIco = p.alive ? '🟢' : '💀';
    const streakTxt = (p.alive && p.streak > 0) ? `🔥${p.streak}` : '—';

    row.innerHTML =
      `<span class="lb-rank">${rank}</span>` +
      `<span class="lb-name">${crownSpan}${escapeHTML(p.name)}</span>` +
      `<span class="lb-score">${p.score.toLocaleString()}</span>` +
      `<span class="lb-streak">${streakTxt}</span>` +
      `<span class="lb-status">${statusIco}</span>`;
    list.appendChild(row);
  });

  // --- FLIP step 2: animate from old position to new ---
  [...list.children].forEach(ch => {
    const id = ch.dataset.id;
    if (oldTop[id] !== undefined) {
      const newTop = ch.getBoundingClientRect().top;
      const dy = oldTop[id] - newTop;
      if (Math.abs(dy) > 1) {
        ch.style.transform = `translateY(${dy}px)`;
        ch.style.transition = 'none';
        requestAnimationFrame(() => {
          ch.style.transition = 'transform 0.6s cubic-bezier(.2,.8,.2,1)';
          ch.style.transform = '';
        });
      }
    }
  });

  // Alive counters.
  const aliveTotal = state.players.filter(p => p.alive).length;
  els.lbAlive.textContent = aliveTotal;
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ===================================================================
   14. HUD UPDATES
   =================================================================== */
function updateHUD() {
  const h = state.humanPlayer;
  const aliveTotal = state.players.filter(p => p.alive).length;

  els.scoreVal.textContent = h.score.toLocaleString();
  els.streakVal.textContent = h.streak;
  els.hudAlive.textContent = aliveTotal;
  els.hudRound.textContent = Math.max(1, state.round);

  // Streak fire grows with the streak.
  if (h.streak > 0) {
    els.streakFire.style.display = 'inline';
    els.streakFire.style.fontSize = (1 + Math.min(h.streak, 8) * 0.14) + 'rem';
    els.streakBox.classList.add('active');
  } else {
    els.streakFire.style.display = 'none';
    els.streakBox.classList.remove('active');
  }

  // HP bar width + color.
  const pct = Math.max(0, h.hp);
  els.hpFill.style.width = pct + '%';
  els.hpText.textContent = Math.round(h.hp);
  els.hpFill.classList.toggle('mid', h.hp <= 55 && h.hp > 30);
  els.hpFill.classList.toggle('low', h.hp <= 30);
}

function bumpStreak() {
  els.streakBox.classList.remove('bump');
  void els.streakBox.offsetWidth;
  els.streakBox.classList.add('bump');
}

function shakeHP() {
  els.hpWrap.classList.remove('shake');
  void els.hpWrap.offsetWidth;
  els.hpWrap.classList.add('shake');
}

/* ===================================================================
   15. VISUAL FX (edge flash, floating score popups)
   =================================================================== */
function flashEdge(color) {
  const cls = color === 'green' ? 'flash-green' : 'flash-red';
  els.edgeFlash.classList.remove('flash-green', 'flash-red');
  void els.edgeFlash.offsetWidth;
  els.edgeFlash.classList.add(cls);
}

function floatScore(text, kind, btn) {
  const pop = document.createElement('div');
  pop.className = 'score-pop ' + kind;
  pop.textContent = text;

  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  if (btn) {
    const r = btn.getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top;
  }
  pop.style.left = x + 'px';
  pop.style.top = y + 'px';
  pop.style.transform = 'translateX(-50%)';
  els.fxLayer.appendChild(pop);
  setTimeout(() => pop.remove(), 1200);
}

/* ===================================================================
   16. END SCREENS
   =================================================================== */
function showVictory() {
  if (!state.active) return;
  const h = state.humanPlayer;
  els.vicScore.textContent  = h.score.toLocaleString();
  els.vicRounds.textContent = state.round;
  els.vicStreak.textContent = h.bestStreak;
  els.victoryScreen.hidden = false;
  launchConfetti();
}

function showDefeat() {
  if (!state.active) return;
  const h = state.humanPlayer;
  const rank = state.players.filter(p => p.alive).length + 1; // survivors outrank you
  els.defScore.textContent  = h.score.toLocaleString();
  els.defRank.textContent   = '#' + rank;
  els.defStreak.textContent = h.bestStreak;
  els.defeatText.textContent =
    `You placed #${rank} of ${TOTAL_PLAYERS}. ` +
    (rank <= 10 ? 'So close to the crown!' : 'Sharpen your vocabulary and try again.');
  els.defeatScreen.hidden = false;
  launchRedParticles();
}

function launchConfetti() {
  const colors = ['#ffd700', '#00d4ff', '#1fe086', '#ff3b5c', '#7b2ff7', '#ffd23f'];
  for (let i = 0; i < 140; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = rand(0, 100) + 'vw';
    piece.style.background = pick(colors);
    piece.style.animationDuration = rand(2.4, 5) + 's';
    piece.style.animationDelay = rand(0, 2.5) + 's';
    piece.style.width = randInt(7, 13) + 'px';
    piece.style.height = randInt(10, 20) + 'px';
    els.particleHost.appendChild(piece);
  }
  // Clean up after the celebration.
  setTimeout(() => { els.particleHost.innerHTML = ''; }, 8000);
}

function launchRedParticles() {
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('div');
    p.className = 'red-particle';
    p.style.left = rand(0, 100) + 'vw';
    p.style.animationDuration = rand(2, 4) + 's';
    p.style.animationDelay = rand(0, 1.5) + 's';
    const s = randInt(5, 11);
    p.style.width = s + 'px';
    p.style.height = s + 'px';
    els.particleHost.appendChild(p);
  }
  setTimeout(() => { els.particleHost.innerHTML = ''; }, 6000);
}

/* ===================================================================
   17. WIRE UP EVENTS
   =================================================================== */
els.startBtn.addEventListener('click', startGame);
els.usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startGame();
});

// Difficulty picker
els.difficultyPick.addEventListener('click', (e) => {
  const b = e.target.closest('.diff-btn');
  if (!b) return;
  [...els.difficultyPick.children].forEach(c => c.classList.remove('active'));
  b.classList.add('active');
  state.difficulty = b.dataset.diff;
});

// Restart buttons (reset everything and go back to the start screen so
// the player can rename / re-pick difficulty).
function restartToStart() {
  state.active = false;          // stop any in-flight rounds / countdowns
  clearInterval(state.timer);    // kill the question timer
  els.roundOverlay.hidden = true;
  els.victoryScreen.hidden = true;
  els.defeatScreen.hidden = true;
  els.gameScreen.hidden = true;
  els.particleHost.innerHTML = '';
  els.fxLayer.innerHTML = '';
  els.startScreen.hidden = false;
}
els.playAgainBtn.addEventListener('click', restartToStart);
els.tryAgainBtn.addEventListener('click', restartToStart);

// "HOME" button inside the match — leave the current run and go back to the
// start screen. Confirm first since the run is lost.
// SUPABASE: also emit a "player left" event / update the player's row here.
els.homeBtn.addEventListener('click', () => {
  if (confirm('Leave the match and return home? Your current run will be lost.')) {
    restartToStart();
  }
});

// Expose a tiny API (handy for debugging / future Supabase hooks).
window.Game = { state, startGame, restart: restartToStart };
