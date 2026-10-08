import { PestInfo } from '../types';

export const PEST_DATABASE: Record<string, PestInfo> = {
  'Fall Armyworm': {
    id: 'fall-armyworm',
    commonName: 'Fall Armyworm',
    scientificName: 'Spodoptera frugiperda',
    localFarmerName: 'Maize Whorl Caterpillar / Armyworm',
    targetCrops: ['Corn (Maize)', 'Sorghum', 'Rice', 'Sugarcane', 'Millet'],
    urgencyLevel: 'critical',
    acousticProfile: {
      frequencyRange: '3.2 kHz – 5.5 kHz',
      soundType: 'Rhythmic leaf chewing and stem rasping clicks',
      description: 'Caterpillar mandibles crunching through thick whorl leaf tissues produce distinct acoustic pulse clusters in the 3.5–5 kHz band detected by the INMP441 microphone.',
    },
    chemicalTreatments: [
      {
        chemicalName: 'Chlorantraniliprole 18.5% SC',
        activeIngredient: 'Chlorantraniliprole (Ryanoid class)',
        recommendedDosage: '0.4 ml per 1 Liter of water (60 ml per acre)',
        applicationMethod: 'Targeted backpack spray directly directed down into the center whorls of maize plants.',
        preHarvestInterval: '14 days before harvest',
      },
      {
        chemicalName: 'Emamectin Benzoate 5% SG',
        activeIngredient: 'Emamectin Benzoate (Avermectin)',
        recommendedDosage: '0.5 g per 1 Liter of water (80–100 g per acre)',
        applicationMethod: 'Coarse droplet cone nozzle directed at infested plant crowns.',
        preHarvestInterval: '7 days before harvest',
      },
    ],
    organicAlternatives: [
      {
        methodName: 'Neem Seed Kernel Extract (NSKE 5%)',
        materials: 'Fresh pulverized neem seed kernels soaked overnight',
        dosageOrSetup: '50 g NSKE per 1 Liter of water mixed with 1 ml liquid soap sticker',
        applicationTiming: 'Early morning or dusk spray weekly when caterpillars are young (1st-2nd instar).',
      },
      {
        methodName: 'Bacillus thuringiensis (Bt kurstaki)',
        materials: 'Commercial biological Bt powder (55,000 ITU/mg)',
        dosageOrSetup: '2 g per 1 Liter of clean water (400 g per acre)',
        applicationTiming: 'Late afternoon; caterpillars consume Bt on leaves within 24–48 hours.',
      },
      {
        methodName: 'Pheromone Lure Trapping',
        materials: 'Funnel pheromone traps with Spodoptera lures',
        dosageOrSetup: '4 to 5 traps per acre placed at crop canopy level',
        applicationTiming: 'Install before tassel emergence to monitor adult moths and break reproduction cycles.',
      },
    ],
    sprayPrecautions: [
      'Spray in late afternoon (after 4:30 PM) when caterpillars leave deep leaf folds to feed and bees are back in hives.',
      'Always aim the nozzle tip directly into the whorl cup where caterpillars hide from sunlight.',
      'Wear protective face mask, rubber boots, and neoprene gloves while handling concentrates.',
      'Avoid spraying if rain is expected within 3 hours to prevent chemical runoff into irrigation ponds.',
    ],
    identificationTips: [
      'Look for inverted "Y" marking on caterpillar head capsule.',
      'Four elevated dark spots forming a square on the 8th abdominal segment.',
      'Window-pane transparent feeding patches on younger leaves and sawdust-like frass in whorls.',
    ],
  },

  'Stem Borer': {
    id: 'stem-borer',
    commonName: 'Stem Borer',
    scientificName: 'Chilo partellus / Busseola fusca',
    localFarmerName: 'Stalk Borer / Shoot Borer',
    targetCrops: ['Maize', 'Sorghum', 'Rice', 'Pearl Millet'],
    urgencyLevel: 'high',
    acousticProfile: {
      frequencyRange: '1.8 kHz – 3.4 kHz',
      soundType: 'Internal pith tunneling vibration & fiber grinding',
      description: 'Larval tunneling inside the vascular pith creates low-mid resonance clicks easily picked up by the INMP441 acoustic probe placed against or near the stalk.',
    },
    chemicalTreatments: [
      {
        chemicalName: 'Cartap Hydrochloride 4% G',
        activeIngredient: 'Cartap Hydrochloride (Granule)',
        recommendedDosage: '7 to 8 kg granules per acre applied to whorls',
        applicationMethod: 'Hand whorl drop using protective glove applicator; moisten soil after application.',
        preHarvestInterval: '21 days before harvest',
      },
      {
        chemicalName: 'Fipronil 5% SC',
        activeIngredient: 'Fipronil (Phenylpyrazole)',
        recommendedDosage: '1.5 ml per 1 Liter of water (300 ml per acre)',
        applicationMethod: 'Foliar spray along stem bases before larvae bore deep into the central stalk.',
        preHarvestInterval: '14 days before harvest',
      },
    ],
    organicAlternatives: [
      {
        methodName: 'Push-Pull Intercropping Strategy',
        materials: 'Intercrop with Desmodium (repellent/push) and Napier grass border (trap/pull)',
        dosageOrSetup: '1 row Desmodium between every 3 maize rows; surround plot with 3 rows of Napier grass',
        applicationTiming: 'Plant at the start of the rainy season alongside crop sowing.',
      },
      {
        methodName: 'Trichogramma Parasitoid Wasps',
        materials: 'Trichogramma chilonis egg cards (Tricho-cards)',
        dosageOrSetup: '20,000 parasitized eggs (2 cards) per acre fastened under leaves',
        applicationTiming: 'Release at 15 and 30 days after crop emergence before larvae bore into stems.',
      },
    ],
    sprayPrecautions: [
      'Chemical treatment is only effective before larvae bore into the core stalk; act promptly upon acoustic alert.',
      'Never broadcast granular insecticides on windy days.',
      'Keep livestock away from treated fields for a minimum of 14 days.',
    ],
    identificationTips: [
      'Pin-hole perforations in neat rows across newly unfurled leaves.',
      'Dead-heart condition (central drying shoot) in young crops, or breaking stalks at maturity.',
    ],
  },

  'Desert Locust': {
    id: 'desert-locust',
    commonName: 'Desert Locust',
    scientificName: 'Schistocerca gregaria',
    localFarmerName: 'Swarm Grasshopper / Desert Locust',
    targetCrops: ['All cereals', 'Vegetables', 'Pasture grasses', 'Orchards'],
    urgencyLevel: 'critical',
    acousticProfile: {
      frequencyRange: '4.0 kHz – 8.2 kHz',
      soundType: 'Wing friction stridulation & synchronized rasping',
      description: 'Rapid leg-wing friction and synchronized feeding sound creates loud, continuous high-frequency buzzing spikes detected immediately by field sensors.',
    },
    chemicalTreatments: [
      {
        chemicalName: 'Malathion 50% EC',
        activeIngredient: 'Malathion (Organophosphate)',
        recommendedDosage: '2.0 ml per 1 Liter of water (400 ml per acre)',
        applicationMethod: 'High-volume tractor boom spray or motorized mist blower across roosting vegetation.',
        preHarvestInterval: '7 days',
      },
      {
        chemicalName: 'Lambda-cyhalothrin 5% EC',
        activeIngredient: 'Lambda-cyhalothrin (Synthetic Pyrethroid)',
        recommendedDosage: '1.0 ml per 1 Liter of water (200 ml per acre)',
        applicationMethod: 'Barrier spraying around field perimeter to intercept marching hoppers.',
        preHarvestInterval: '10 days',
      },
    ],
    organicAlternatives: [
      {
        methodName: 'Metarhizium acridum Bio-pesticide',
        materials: 'Entomopathogenic fungus oil suspension (Green Muscle / Novacrid)',
        dosageOrSetup: '50 g spores mixed in 1 Liter diesel or vegetable carrier oil per hectare',
        applicationTiming: 'ULV spray over roosting bands early in the morning when hoppers are sluggish.',
      },
      {
        methodName: 'Acoustic & Mechanical Deterrence',
        materials: 'Loud percussive farm noise, smoke trenches along field borders',
        dosageOrSetup: 'Continuous dawn noise to prevent incoming flying swarms from settling',
        applicationTiming: 'At dawn before swarm takes flight and during midday descent.',
      },
    ],
    sprayPrecautions: [
      'Treat roosting hoppers between 5:30 AM and 7:30 AM while temperatures are cool and insects are immobile.',
      'Avoid spraying near open irrigation canals, fishponds, or honeybee apiaries.',
      'Equip spray operators with full chemical coveralls, goggles, and respirators.',
    ],
    identificationTips: [
      'Solitary form is green or brown; gregarious swarming form turns bright yellow with black markings.',
      'Sudden loss of complete foliage within hours if unmitigated.',
    ],
  },

  'Corn Earworm': {
    id: 'corn-earworm',
    commonName: 'Corn Earworm',
    scientificName: 'Helicoverpa zea / armigera',
    localFarmerName: 'Earworm / Pod Borer / Fruit Borer',
    targetCrops: ['Sweet Corn', 'Field Maize', 'Tomato', 'Chickpea', 'Cotton'],
    urgencyLevel: 'high',
    acousticProfile: {
      frequencyRange: '2.4 kHz – 4.2 kHz',
      soundType: 'Silk chewing clicks & husk cavity rasping',
      description: 'Munching through tender silk fibers and upper ear kernels produces steady high-frequency impulse clicks registered by the INMP441 acoustic sensor.',
    },
    chemicalTreatments: [
      {
        chemicalName: 'Spinetoram 11.7% SC',
        activeIngredient: 'Spinetoram (Spinosyn class)',
        recommendedDosage: '1.0 ml per 1 Liter of water (150–200 ml per acre)',
        applicationMethod: 'Directed spray at ear silk zone starting at first silk emergence.',
        preHarvestInterval: '3 days for sweet corn',
      },
      {
        chemicalName: 'Indoxacarb 14.5% SC',
        activeIngredient: 'Indoxacarb (Oxadiazine)',
        recommendedDosage: '1.0 ml per 1 Liter of water (200 ml per acre)',
        applicationMethod: 'Fine mist spray applied thoroughly around ears and developing flowers.',
        preHarvestInterval: '7 days',
      },
    ],
    organicAlternatives: [
      {
        methodName: 'Helicoverpa armigera NPV (HaNPV)',
        materials: 'Nuclear Polyhedrosis Virus liquid formulation',
        dosageOrSetup: '1.5 ml per 1 Liter of water with 1 g jaggery/molasses as feeding stimulant',
        applicationTiming: 'Spray late afternoon during cloudy weather; virus remains potent out of direct UV.',
      },
      {
        methodName: 'Mineral Oil Silk Treatment',
        materials: 'Food-grade vegetable or mineral oil dropper',
        dosageOrSetup: '0.5 ml oil placed with medicine dropper directly into tip of each ear silk channel',
        applicationTiming: 'Apply 4 to 5 days after silks first show (after pollination is complete).',
      },
    ],
    sprayPrecautions: [
      'Do not apply oil until silk tips have wilted/turned brown to avoid pollination failure.',
      'Rotate chemical classes (Spinosyns with Oxadiazines) to prevent insecticide resistance.',
      'Wash spray equipment thoroughly with clean water away from drinking wells.',
    ],
    identificationTips: [
      'Caterpillar color varies from light green, pink, brown to nearly black with alternating dark stripes.',
      'Brown, chewed silk at the ear tip with mushy frass around top kernels.',
    ],
  },

  'Red Palm Weevil': {
    id: 'red-palm-weevil',
    commonName: 'Red Palm Weevil',
    scientificName: 'Rhynchophorus ferrugineus',
    localFarmerName: 'Palm Trunk Weevil / Coconut Borer',
    targetCrops: ['Coconut Palms', 'Date Palms', 'Oil Palms', 'Ornamental Palms'],
    urgencyLevel: 'critical',
    acousticProfile: {
      frequencyRange: '1.2 kHz – 2.8 kHz',
      soundType: 'Deep fibrous trunk gnawing & wood cavitation',
      description: 'Large grub larvae chewing internal trunk fibers create continuous resonant ticking and chewing sounds that propagate along the trunk wood into the INMP441 acoustic sensor.',
    },
    chemicalTreatments: [
      {
        chemicalName: 'Imidacloprid 17.8% SL (Trunk Injection)',
        activeIngredient: 'Imidacloprid (Neonicotinoid)',
        recommendedDosage: '10 to 15 ml diluted with 10 ml water per palm trunk',
        applicationMethod: 'Drill 10 cm hole at 45-degree angle 1 meter from base; inject solution and seal with clay/cement.',
        preHarvestInterval: '45 days before coconut/date harvest',
      },
      {
        chemicalName: 'Chlorpyrifos 20% EC (Crown Drench)',
        activeIngredient: 'Chlorpyrifos (Organophosphate)',
        recommendedDosage: '5 ml per 1 Liter of water (3–4 Liters per crown)',
        applicationMethod: 'Pour into top leaf axils around heart of palm to kill adult weevils entering wounds.',
        preHarvestInterval: '60 days',
      },
    ],
    organicAlternatives: [
      {
        methodName: 'Aggregation Pheromone Bucket Traps (Ferrolure+)',
        materials: 'Specialized bucket traps containing Ferrolure, ripe pineapple, and soapy water',
        dosageOrSetup: '1 trap per 2 acres hung on boundary trees at 1.5 meter height in shade',
        applicationTiming: 'Maintain year-round; refresh fruit bait every 10–14 days.',
      },
      {
        methodName: 'Beauveria bassiana Fungal Treatment',
        materials: 'Entomopathogenic bio-fungus paste',
        dosageOrSetup: '20 g fungal powder per Liter water made into slurry paste applied to fresh trunk pruning cuts',
        applicationTiming: 'Apply immediately after any leaf pruning or frond cutting.',
      },
    ],
    sprayPrecautions: [
      'Do not harvest fruits or consume palm sap/water within 45 days after trunk injection.',
      'Always seal drill injection holes with fungicide paste and moist clay plug to prevent secondary fungus rot.',
      'Avoid creating unnecessary wounds or machete cuts on palm trunks during wet seasons.',
    ],
    identificationTips: [
      'Acoustic gnawing heard when ear or sensor probe is placed directly against the trunk.',
      'Thick fermented brown liquid oozing from small holes in the trunk.',
      'Central crown leaves wilted or snapped to one side ("umbrella top" collapse).',
    ],
  },
};

export const DEFAULT_PEST = PEST_DATABASE['Fall Armyworm'];
