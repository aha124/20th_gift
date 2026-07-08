import type { Story } from '../engine/types'

// ---------------------------------------------------------------------------
// THE WORDS LIVE HERE. Edit any line without touching a single component.
//
// Anything written like [FILL: ...] is a spot for Anthony to drop in a real
// line, a real song title, or a real photo. The game runs fine with the
// placeholders in place — replace them whenever you're ready.
// ---------------------------------------------------------------------------

export const HER_SN = 'grluxy'
export const HIS_SN = 'star4ker21x'

// Shown in the AIM buddy-info popup. Keep the quote line yours, typed from
// memory — do not paste copyrighted lyrics. See README.
export const HIS_PROFILE = {
  status: 'in the black, always in the black',
  quote: '[FILL: a Guster or GNR line you remember, typed by you]',
}

export const BOOT_LINE = 'For Ashley. Twenty years. Here is exactly how it started.'

export const story: Story = {
  chapters: [
    // ----------------------------------------------------------------- Ch 1
    {
      id: 'ditch',
      number: 1,
      title: 'The Ditch',
      beats: [
        { kind: 'title', title: 'Chapter One', subtitle: 'The Ditch' },
        {
          kind: 'interaction',
          variant: 'cd-swerve',
          lines: [
            'It is the night before you leave for a school you are not even sure you want to go to.',
            'Staten Island might as well be the far side of the moon, and your dad is the only reason you are going at all.',
            'You are driving home from a conversation that did not go well, and you reach down for a CD, and for one second your eyes leave the road.',
          ],
          after: [
            'The van drifts, the shoulder disappears, and now you are sitting in a ditch with your heart going a hundred miles an hour.',
            'You are fine. The van, mostly.',
            'And you could be forgiven, right about then, for deciding this is the universe telling you to just stay home.',
            'You go anyway. Thank God you go anyway.',
          ],
        },
      ],
    },

    // ----------------------------------------------------------------- Ch 2
    {
      id: 'mentalist',
      number: 2,
      title: 'The Mentalist',
      beats: [
        { kind: 'title', title: 'Chapter Two', subtitle: 'The Mentalist' },
        {
          kind: 'narration',
          lines: [
            'You get to Wagner late, because of course you do.',
            'Mark walks you into some all-purpose room where a man who calls himself a mentalist is halfway through convincing a row of freshmen that they are chickens.',
            'And off to the side there is this other guy, dressed head to toe in black, because he had just come from an audition and apparently owns no other colors.',
            'That is me.',
          ],
        },
        {
          kind: 'hypnosis',
          intro: 'The mentalist locks eyes with the room. Do not cluck. Whatever you do, do not cluck. Mash Resist to hold out.',
          commands: [
            'you are getting very sleepy…',
            'when I snap, you are a chicken',
            'you feel your wings… you feel the urge…',
            'look into my eyes, only my eyes',
            'a proud, beautiful hen',
          ],
          after: [
            'The mentalist moves on to easier prey.',
            'And that is when I really noticed you, holding it together three seats over.',
          ],
        },
        {
          kind: 'narration',
          lines: [
            'I saw you come in. Red hair, fair skin, that look on your face like you had not decided whether to stay.',
            'I forgot the entire rest of the room.',
          ],
        },
        {
          kind: 'dialogue',
          prompt: 'Afterward it is you, me, Mark, and Tanya, talking like we had been doing it for years. I ask why you are so late.',
          choices: [
            {
              text: 'Long story. There may have been a ditch.',
              reply: [
                'A ditch. Of course there was a ditch.',
                'I decide right then that I want to hear every long story you have.',
              ],
            },
            {
              text: 'I almost did not come at all.',
              reply: [
                'You almost did not come at all.',
                'I think about that more than you know. How close this all came to never happening.',
              ],
            },
            {
              text: 'Are you always dressed like that?',
              reply: [
                'Only when I am trying to make an impression. Or when I own nothing else.',
                'It was the second one. It was definitely the second one.',
              ],
            },
          ],
          after: [
            'At some point you look right at me and say, "you are definitely older than everybody else here."',
            'I was. I had already had a whole other life at NYU and walked away from it.',
            'You were eighteen, about to turn nineteen. I was a wise old man of twenty.',
          ],
        },
      ],
    },

    // ----------------------------------------------------------------- Ch 3
    {
      id: 'buddylist',
      number: 3,
      title: 'Buddy List',
      beats: [
        { kind: 'title', title: 'Chapter Three', subtitle: 'Buddy List' },
        {
          kind: 'narration',
          lines: [
            'We were in the same building. You three or four floors up, me down on the first.',
            'Same learning community. Same classes. Same everything, it turned out.',
            'So mostly we talked here.',
          ],
        },
        {
          kind: 'aim',
          buddyAway: '[FILL, e.g. "in the black, always in the black"]',
          script: [
            {
              from: 'him',
              text: 'i cant believe Toth offered extra credit to anyone who could get her dog’s medicine out of the vacuum cleaner she brought to class today',
              delayMs: 1100,
            },
            { type: 'playerInput', mode: 'freeform', placeholder: 'type something' },
            {
              from: 'him',
              text: 'we have the same everything you realize. same LC, same classes, i basically cannot escape you',
              delayMs: 1400,
            },
            { from: 'him', text: 'not that i am trying', delayMs: 900 },
            { type: 'playerInput', mode: 'freeform', placeholder: 'type something' },
            {
              from: 'him',
              text: 'want to hang out later? i have exactly no money and nowhere to be',
              delayMs: 1300,
            },
            { type: 'playerInput', mode: 'freeform', placeholder: 'type something' },
            {
              from: 'him',
              text: 'also. wicked. you really do not have to pay for me',
              delayMs: 1400,
            },
            {
              from: 'him',
              text: 'you are going to pay for me though arent you',
              delayMs: 1100,
            },
            { type: 'playerInput', mode: 'freeform', placeholder: 'type something' },
            {
              from: 'him',
              text: 'you are the best. i will pay you back in like fifteen years',
              delayMs: 1400,
            },
          ],
        },
        {
          kind: 'narration',
          lines: [
            'We talked more on that concrete stoop than anywhere.',
            'No money, no plan, just the two of us and whatever was going to happen next.',
          ],
        },
      ],
    },

    // ----------------------------------------------------------------- Ch 4
    {
      id: 'laundry',
      number: 4,
      title: 'Laundry',
      beats: [
        { kind: 'title', title: 'Chapter Four', subtitle: 'Laundry' },
        {
          kind: 'narration',
          lines: [
            'It was laundry. Of all the ways it could have happened, it was laundry.',
            'We were done, the baskets loaded into the backseat of my old black Mitsubishi Galant.',
            'It was raining, so we just sat there a while with the radio on.',
          ],
        },
        {
          kind: 'narration',
          lines: [
            'A Guns N’ Roses song was on.',
            'The windows fogged, the rain kept coming, and we kissed.',
            'Just like that. Laundry, of all things.',
          ],
        },
      ],
    },

    // ----------------------------------------------------------------- Ch 5
    {
      id: 'room1xx',
      number: 5,
      title: 'Room 1xx',
      beats: [
        { kind: 'title', title: 'Chapter Five', subtitle: 'Room 1xx' },
        {
          kind: 'pointclick',
          intro: 'Your roommate kept vanishing, and then was gone for good, so I more or less moved in. Have a look around. Everything in here is a story.',
          objects: [
            {
              id: 'beds',
              label: 'the two beds',
              x: 20,
              y: 34,
              emoji: '\u{1F6CF}\u{FE0F}',
              memory: [
                'There were two beds in that little room, and one day you decided to rearrange the whole thing.',
                'You stood one of the frames straight up against the wall. It looked completely insane, and you knew it.',
                'You looked around at the disaster, said you could not be in there another second, and went to shower. Could I please just fix it.',
                'So I put the entire room back. Every frame, every poster, every bag, exactly where it had been.',
                'You came back to a room that looked like nothing had happened. You could not believe I did not just run for it.',
                'I think that might be the day you decided to keep me.',
              ],
            },
            {
              id: 'tv',
              label: 'the little TV',
              x: 68,
              y: 30,
              emoji: '\u{1F4FA}',
              memory: [
                'Boy Meets World on the little TV, night after night.',
                'Chinese food paid for out of a change jar we raided for quarters.',
                'We had nothing and I would not trade a minute of it.',
              ],
            },
            {
              id: 'guitar',
              label: 'the guitar',
              x: 82,
              y: 58,
              emoji: '\u{1F3B8}',
              memory: [
                'The guitar. I could actually play, and I still can.',
                'Me always trying to impress you, playing for you any chance I got.',
              ],
            },
            {
              id: 'door',
              label: 'the door',
              x: 10,
              y: 64,
              emoji: '\u{1F6AA}',
              memory: [
                'You got locked out once, standing in the hall, certain you were done for.',
                'I slid a credit card down the frame and popped it in one try, like I did it for a living.',
                'I did not do it for a living. I got very lucky. You looked at me like a magician.',
              ],
            },
            {
              id: 'bathroom',
              label: 'the hall bathroom',
              x: 54,
              y: 18,
              emoji: '\u{1F6BB}',
              memory: [
                'It was an all-guys floor, and sometimes you were on it, and sometimes you needed the bathroom.',
                'So you learned to lift your feet up in the stall and go dead silent when the door opened.',
                'A whole covert operation, just to spend a few more minutes down here with me.',
              ],
            },
          ],
          outro: [
            'A hundred square feet of the best year of my life up to then.',
          ],
        },
      ],
    },

    // ----------------------------------------------------------------- Ch 6
    {
      id: 'ifc',
      number: 6,
      title: 'IFC',
      beats: [
        { kind: 'title', title: 'Chapter Six', subtitle: 'IFC' },
        {
          kind: 'narration',
          lines: [
            'Our first official date. Not the stoop, not laundry. A real one.',
            'The IFC theater in the city. The movie was Me and You and Everyone We Know.',
            'Let us do the whole day, start to finish.',
          ],
        },
        {
          kind: 'ifcdate',
          after: [
            'That was the day that turned the two of us into independent-film people for good.',
            'We have chased small strange beautiful movies ever since, and it started right there.',
          ],
        },
      ],
    },

    // ----------------------------------------------------------------- Ch 7
    {
      id: 'winter',
      number: 7,
      title: 'Winter Break',
      beats: [
        { kind: 'title', title: 'Chapter Seven', subtitle: 'Winter Break' },
        {
          kind: 'narration',
          lines: [
            'Over the holidays I drove all the way to your grandparents’ house, just to see you. Hours of it. Worth every mile.',
            'Your grandfather, Pappy, had Parkinson’s and a little dementia, and he wandered the house at night.',
            'Once I woke in the dark to him standing right at the foot of the bed, just watching. Terrifying in the moment.',
            'One of a hundred strange, eccentric things that all turned into funny stories later.',
          ],
        },
        {
          kind: 'staystill',
          intro: 'It is the middle of the night, and Pappy is up again, shuffling toward the foot of the bed. Duck under the covers and hold perfectly still whenever his eyes are open, so he does not see you are awake.',
          after: [
            'He stared a while, decided the world was in order, and shuffled back off down the hall.',
            'You did not wake up for any of it. I decided not to mention it until morning.',
          ],
        },
        {
          kind: 'narration',
          lines: ['Before a weekend we had to spend apart, I wrote a few Guster lines on your dry-erase board.'],
        },
        {
          kind: 'narration',
          lines: [
            '“You were almost kind',
            'You were almost true',
            'Why give away the other side of you?',
            'You have learned in time',
            'That you must be cruel',
            'I’ll have to wait to get the best of you”',
          ],
        },
        {
          kind: 'stairwell',
          intro: 'Our friends came looking for us, opening door after door. So the two of us slipped into the stairwell to disappear. Get both of you down the stairs while their footsteps are far — freeze the moment they get close.',
          after: [
            'We made it to the bottom, breathless and laughing into our own hands.',
            'We just wanted to be alone. We always just wanted to be alone.',
          ],
        },
        {
          kind: 'nokia',
          target: 'goodnight',
          prompt: 'One more thing before the lights go out. Tap out a goodnight to her on the old Nokia. [FILL: change the target word if you like.]',
          after: [
            'Send. Somewhere a few floors or a few hundred miles away, a little screen lit up.',
            'That was the whole technology of being in love in 2004. A screen lighting up in the dark.',
          ],
        },
        {
          kind: 'photo',
          srcName: 'guitar.jpg',
          caption: 'The guitar.',
          fallbackNote: 'Drop the guitar photo at src/assets/guitar.jpg and it appears here.',
        },
      ],
    },

    // ----------------------------------------------------------------- Ch 8
    {
      id: 'countryclub',
      number: 8,
      title: 'The Country Club',
      beats: [
        { kind: 'title', title: 'Chapter Eight', subtitle: 'The Country Club' },
        {
          kind: 'narration',
          lines: [
            'You flat out lied to me, and I am so glad you did.',
            'You told me the country club was a wonderful place to work. It was anything but.',
            'But I did not care even a little. It meant a whole summer with you.',
            'I had bartended before, so I could do the job just fine. That the place was miserable never once mattered.',
          ],
        },
        {
          kind: 'narration',
          lines: [
            'It meant I lived at your parents’ house all summer.',
            'Late nights. You washing dishes at the place in Sonestown, me behind the bar trying my best to keep a straight face.',
          ],
        },
        {
          kind: 'dishes',
          intro: 'Closing time at Sonestown, and the pit is stacked to the ceiling. Hold a dish and scrub it around to get it clean. Clear the rack before you can go.',
          after: [
            'I was so glad just to be near you that I would have done the whole summer over again, and changed nothing about it.',
            'This was the runway to everything. I just did not know it yet.',
          ],
        },
      ],
    },

    // ----------------------------------------------------------------- Ch 9
    {
      id: 'balcony',
      number: 9,
      title: 'The Balcony',
      beats: [
        { kind: 'title', title: 'Chapter Nine', subtitle: 'The Balcony' },
        {
          kind: 'balcony',
          intro: [
            'Second floor porch. Both of us home late, the stars actually out for once.',
            'I opened my mouth and said, “I don’t have much to offer you.”',
          ],
          setup: [
            'I was desperate for you to say yes.',
            'You could have said no so easily. We had no business getting married, we were far too young.',
            'But we both already knew this was exactly where it was always going.',
          ],
          prompt: 'Then I got down on the porch and held out the ring, which was not much of a ring. And I asked.',
          choices: [
            { text: 'Yes.', reply: ['Yes.'] },
            { text: 'Yes, obviously, get up.', reply: ['Yes, obviously, get up.'] },
            {
              text: 'Are you breaking up with me?',
              reply: ['Are you breaking up with me?', 'No. God, no. The exact opposite.', '…Then yes.'],
            },
          ],
          after: [
            'It did not matter at all that the ring was small.',
            'You said yes, and the whole rest of my life started on that porch.',
          ],
        },
      ],
    },

    // ----------------------------------------------------------------- Ch 10
    {
      id: 'worldsend',
      number: 10,
      title: 'Worlds End',
      beats: [
        { kind: 'title', title: 'Chapter Ten', subtitle: 'Worlds End' },
        {
          kind: 'narration',
          lines: [
            'A tiny ceremony in the woods at Worlds End State Park.',
            'Just us and whatever family was close. My mom among them.',
            'Humble, and beautiful, and completely ours.',
          ],
        },
        {
          kind: 'photo',
          srcName: 'wedding.jpg',
          caption: 'Worlds End. The tiny wedding in the woods.',
          fallbackNote: 'Drop the wedding photo at src/assets/wedding.jpg and it appears here.',
        },
        {
          kind: 'narration',
          lines: [
            'This was the first time. A year later we did it all again, bigger, at the fire hall.',
            'So it has been twenty-one years since these woods, and twenty since that second one.',
            'We have never once agreed on which number is the real one. We just say twenty and call it even.',
          ],
        },
      ],
    },

    // ----------------------------------------------------------------- Ch 11
    {
      id: 'coda',
      number: 11,
      title: 'Coda',
      beats: [
        {
          kind: 'coda',
          script: [
            { from: 'him', text: 'grluxy. you there?', delayMs: 1400 },
            {
              from: 'him',
              text: 'it has been twenty years. we got married in the woods with almost nobody watching. we ran away from Disney like thieves in the night. we scraped change together for Chinese food.',
              delayMs: 3200,
            },
            {
              from: 'him',
              text: 'and somehow all of that turned into a house in Hershey, and Sal, and Annie, and Bowie, and Penny, and this whole enormous life.',
              delayMs: 3000,
            },
            {
              from: 'him',
              text: 'i still struggle every single day to find new ways to say it. that i love our life. that i love you. that i have never once been happier.',
              delayMs: 3400,
            },
            {
              from: 'him',
              text: 'we were so young and so reckless. a hundred things could have gone wrong and none of them did. and i know now that in every version of this, in every reality, it always ends up right here. with you.',
              delayMs: 3600,
            },
            {
              from: 'him',
              text: 'happy anniversary. i love you. still star4ker. still yours.',
              delayMs: 2600,
            },
          ],
        },
      ],
    },

    // ------------------------------------------------------------ Ch 12 bonus
    {
      id: 'thieves',
      number: 'bonus',
      title: 'Thieves in the Night',
      bonus: true,
      beats: [
        { kind: 'title', title: 'Bonus Chapter', subtitle: 'Thieves in the Night' },
        {
          kind: 'narration',
          lines: [
            'The Disney College Program.',
            'Me on nights at Chef Mickey’s, you on days at the dinosaur ride, the two of us passing each other like ships and syncing our one day off to go be tourists in our own park.',
            'The whole thing was quietly a total wash financially. We did not care even a little.',
          ],
        },
        {
          kind: 'narration',
          lines: [
            'And then the getaway.',
            'In the dark, we told exactly one costume desk we would not be coming back, and started loading the little Toyota.',
            'Everything the two of us owned had to fit in that car.',
          ],
        },
        {
          kind: 'carpack',
          intro: 'Everything you own, into the back of the Toyota. Drag each thing into the trunk so it all fits — no room to spare and a long drive ahead.',
          after: [
            'Somehow it all fit. It always somehow fit.',
            'We drove straight through from Florida to Pennsylvania. No plan. No sense. Two kids and a full tank.',
            'We were young and a little dumb, and it is a great story now.',
          ],
        },
        {
          kind: 'narration',
          lines: ['Okay. That is the last one. For real this time.'],
        },
      ],
    },
  ],
}
