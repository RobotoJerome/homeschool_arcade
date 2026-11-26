/* HARD story: The Night Bushy Ben Stopped. Three rooms (two start locked), five suspects,
   and a convincing false theory in every version. */
SQH.addStory({
  id: 'bushy-ben',
  tier: 'hard',
  title: 'The Night Bushy Ben Stopped',
  blurb: 'London\'s great clock tower falls silent on the eve of the Jubilee.',
  question: 'Who stopped Bushy Ben, how did they do it, and why?',
  rooms: [
    { id: 'gear', name: 'Gear Room', art: 'gear-room' },
    { id: 'workshop', name: 'Clockmaker\'s Workshop', art: 'workshop' },
    { id: 'station', name: 'Paddingtail Station', art: 'station' }
  ],
  suspects: [
    { id: 'gnawriarty', name: 'Professor Gnawriarty', short: 'the Professor', role: 'Holmes\'s old rival' },
    { id: 'tock', name: 'Master Tobias Tock', short: 'Master Tock', role: 'Keeper of the clock tower' },
    { id: 'wren', name: 'Wren Whiskerton', short: 'Wren', role: 'Tock\'s apprentice, a flying squirrel' },
    { id: 'rootley', name: 'Alderman Reginald Rootley', short: 'the Alderman', role: 'City alderman' },
    { id: 'plume', name: 'Madame Odette Plume', short: 'Madame Plume', role: 'Stage magician' }
  ],
  briefing: [
    { who: 'watson', face: 'shocked', text: 'Holmes, Bushy Ben has stopped! On the night before the Jubilee! Its gears are jammed solid with acorns.' },
    { who: 'holmes', face: 'suspicious', text: 'And a calling card from Professor Gnawriarty was found wedged in the works. How very convenient.' },
    { who: 'watson', face: 'neutral', text: 'Convenient? Surely it\'s a confession!' },
    { who: 'holmes', face: 'smug', text: 'Or an invitation to be fooled. Every alibi will need checking against the clock, Watson.' }
  ]
});
