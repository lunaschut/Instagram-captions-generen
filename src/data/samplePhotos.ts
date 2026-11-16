import { SamplePhoto } from '../types';
import sample0 from '../assets/images/sample_concert_live_1791364117581.jpg';
import sample1 from '../assets/images/sample_nightlife_dj_1791364129353.jpg';
import sample2 from '../assets/images/sample_city_outfit_1790689102295.jpg';
import sample3 from '../assets/images/sample_vacation_beach_1790689079432.jpg';
import sample4 from '../assets/images/sample_coffee_lifestyle_1790689091862.jpg';

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: 'sample-concert',
    title: 'Concerts & Festivals',
    description: 'Live performance met dramatisch podiumlicht, rook en festival-energie',
    contextHint: 'Live optreden tijdens een uitverkochte festivalshow, epische visuals en dampende energie in de zaal.',
    imagePath: sample0,
  },
  {
    id: 'sample-nightlife',
    title: 'Nightlife & Party',
    description: 'Underground clubavond, DJ achter de decks en dansend publiek',
    contextHint: 'Zaterdagnacht clubavond, dampende beats tot vroeg in de ochtend met de beste mensen.',
    imagePath: sample1,
  },
  {
    id: 'sample-portrait',
    title: 'Portraits & Street Style',
    description: 'Editorial modeportret op een historische stadsbrug',
    contextHint: 'Portretshoot in het centrum, herfstlicht en een casual minimalistische streetstyle outfit.',
    imagePath: sample2,
  },
  {
    id: 'sample-beach',
    title: 'Travel & Lifestyle',
    description: 'Zonnige Middellandse Zeekust met turquoise water en gouden zon',
    contextHint: 'Dit was tijdens onze vakantie in Italië en we waren hier voor een ontspannen dagje aan zee.',
    imagePath: sample3,
  },
  {
    id: 'sample-cafe',
    title: 'Cozy Morning & Details',
    description: 'Artisan cappuccino, croissant en notitieboek in een koffiebar',
    contextHint: 'Zondagochtend bij mijn favoriete koffietentje met een goed boek en verse filterkoffie.',
    imagePath: sample4,
  },
];

