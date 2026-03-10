export const MILITARY_ASSETS = [
  {
    id: 'b2-spirit',
    catId: '2',
    name: 'B-2 Spirit',
    featured: true,
    img: 'b2.jpg',
    model: 'b2.glb',
    dangerLevel: 10,
    threatType: 'Strategic Stealth Bomber',
    specs: { 
      range: '11,000 km', 
      speed: 'Mach 0.95', 
      generation: '4th (Stealth)', 
      country: 'USA',
      rcs: '0.0001 m²',
      engine: '4 × General Electric F118-GE-100',
      role: 'Deep penetration strategic strike'
    }
  },
  {
    id: 'f35i-adir',
    catId: '2',
    name: 'F-35I Adir',
    featured: true,
    img: 'f35i.jpg',
    model: 'f35i.glb',
    dangerLevel: 9,
    threatType: 'Multi-role Stealth Fighter',
    specs: { 
      range: '2,200 km', 
      speed: 'Mach 1.6', 
      generation: '5th', 
      country: 'Israel',
      rcs: '0.001 m²',
      engine: 'Pratt & Whitney F135-PW-100',
      role: 'Intelligence and precision strike'
    }
  },
  {
    id: 'shahed-136',
    catId: '4',
    name: 'Shahed-136',
    featured: true,
    img: 'shahed.jpg',
    model: 'shahed.glb',
    dangerLevel: 8,
    threatType: 'Loitering Munition',
    specs: { 
      range: '2,500 km', 
      speed: '185 km/h', 
      generation: 'Expendable Drone', 
      country: 'Iran',
      rcs: '0.01 m²',
      engine: 'MD-550 piston engine',
      role: 'Swarms and infrastructure attrition'
    }
  },
  {
    id: 'fattah-2',
    catId: '4',
    name: 'Fattah-2',
    featured: true,
    img: 'fattah2.jpg',
    model: 'fattah2.glb',
    dangerLevel: 10,
    threatType: 'Hypersonic Glide Vehicle',
    specs: { 
      range: '1,400 km', 
      speed: 'Mach 15+', 
      generation: 'Hypersonic Glide', 
      country: 'Iran',
      rcs: 'Low (due to plasma shielding)',
      engine: 'Liquid propellant rocket',
      role: 'ABM system penetration'
    }
  },
  {
    id: 'arrow-3',
    catId: '3',
    name: 'Arrow 3',
    featured: true,
    img: 'arrow3.jpg',
    model: 'arrow3.glb',
    dangerLevel: 9,
    threatType: 'Exo-atmospheric Interceptor',
    specs: { 
      range: '2,400 km', 
      speed: 'Hypersonic', 
      generation: 'Upper-tier Missile Defense', 
      country: 'Israel',
      rcs: 'N/A (Interceptor)',
      engine: 'Two-stage solid propellant',
      role: 'ICBM/Hypersonic Interception'
    }
  },
  {
    id: 'iron-dome',
    catId: '3',
    name: 'Iron Dome',
    featured: false,
    img: 'iron_dome.jpg',
    model: 'iron_dome.glb',
    dangerLevel: 6,
    threatType: 'Short-range Air Defense',
    specs: { range: '70 km', speed: 'Mach 2.2', generation: 'C-RAM', country: 'Israel' }
  },
  {
    id: 'f22-raptor',
    catId: '2',
    name: 'F-22 Raptor',
    featured: true,
    img: 'f22.jpg',
    model: 'f22.glb',
    dangerLevel: 10,
    threatType: 'Air Superiority Stealth Fighter',
    specs: { range: '3,000 km', speed: 'Mach 2.25', generation: '5th', country: 'USA' }
  },
  {
    id: 'mq9-reper',
    catId: '4',
    name: 'MQ-9 Reaper',
    featured: false,
    img: 'mq9.jpg',
    model: 'mq9.glb',
    dangerLevel: 7,
    threatType: 'MALE Surveillance/Strike UAV',
    specs: { range: '1,900 km', speed: '482 km/h', generation: 'MALE UAV', country: 'USA' }
  },
  {
    id: 'merkava-iv',
    catId: '1',
    name: 'Merkava Mk4',
    featured: true,
    img: 'merkava.jpg',
    model: 'merkava.glb',
    dangerLevel: 8,
    threatType: 'Main Battle Tank',
    specs: { range: '500 km', speed: '64 km/h', generation: '4th (Trophy APS)', country: 'Israel' }
  },
  {
    id: 'karrar-tank',
    catId: '1',
    name: 'Karrar',
    featured: false,
    img: 'karrar.jpg',
    model: 'karrar.glb',
    dangerLevel: 7,
    threatType: 'Main Battle Tank',
    specs: { range: '550 km', speed: '70 km/h', generation: '3rd+', country: 'Iran' }
  },
  {
    id: 's400-triumph',
    catId: '3',
    name: 'S-400 Triumph',
    featured: true,
    img: 's400.jpg',
    model: 's400.glb',
    dangerLevel: 9,
    threatType: 'Long-range Surface-to-Air Missile',
    specs: { range: '400 km', speed: 'Mach 14', generation: 'Long Range SAM', country: 'Russia/Iran Context' }
  },
  {
    id: 'patriot-pac3',
    catId: '3',
    name: 'Patriot PAC-3',
    featured: false,
    img: 'patriot.jpg',
    model: 'patriot.glb',
    dangerLevel: 9,
    threatType: 'Tactical Air Defense',
    specs: { range: '160 km', speed: 'Mach 4.1', generation: 'Advanced ABM', country: 'USA' }
  },
  {
    id: 'zelzal-3',
    catId: '4',
    name: 'Zelzal-3',
    featured: false,
    img: 'zelzal3.jpg',
    model: 'zelzal3.glb',
    dangerLevel: 7,
    threatType: 'Solid-fuel Artillery Rocket',
    specs: { range: '200 km', speed: 'Supersonic', generation: 'Solid Propellant', country: 'Iran' }
  },
  {
    id: 'ah64e-apache',
    catId: '2',
    name: 'AH-64E Apache',
    featured: true,
    img: 'apache.jpg',
    model: 'apache.glb',
    dangerLevel: 8,
    threatType: 'Attack Helicopter',
    specs: { range: '480 km', speed: '293 km/h', generation: 'Guardians', country: 'USA/Israel' }
  },
  {
    id: 'ia-heron-tp',
    catId: '4',
    name: 'IAI Heron TP',
    featured: false,
    img: 'heron.jpg',
    model: 'heron.glb',
    dangerLevel: 7,
    threatType: 'Strategic UAV',
    specs: { range: '7,400 km', speed: '407 km/h', generation: 'Strategic UAV', country: 'Israel' }
  },
  {
    id: 'm1a2-sepv3',
    catId: '1',
    name: 'M1A2 SEPv3',
    featured: true,
    img: 'abrams.jpg',
    model: 'abrams.glb',
    dangerLevel: 9,
    threatType: 'Main Battle Tank',
    specs: { range: '426 km', speed: '67 km/h', generation: '3rd+ (Next-Gen)', country: 'USA' }
  },
  {
    id: 'thaad',
    catId: '3',
    name: 'THAAD',
    featured: true,
    img: 'thaad.jpg',
    model: 'thaad.glb',
    dangerLevel: 9,
    threatType: 'Terminal Missile Defense',
    specs: { range: '200 km', speed: 'Mach 8.2', generation: 'Terminal Defense', country: 'USA' }
  },
  {
    id: 'mohajer-6',
    catId: '4',
    name: 'Mohajer-6',
    featured: false,
    img: 'mohajer6.jpg',
    model: 'mohajer6.glb',
    dangerLevel: 7,
    threatType: 'Tactical Unmanned Combat Aerial Vehicle',
    specs: { range: '2,000 km', speed: '200 km/h', generation: 'Tactical UCAV', country: 'Iran' }
  },
  {
    id: 'f15ia',
    catId: '2',
    name: 'F-15IA',
    featured: false,
    img: 'f15ia.jpg',
    model: 'f15ia.glb',
    dangerLevel: 8,
    threatType: 'Multi-role Fighter jet',
    specs: { range: '4,800 km', speed: 'Mach 2.5', generation: '4.5 Stealthy', country: 'Israel' }
  },
  {
    id: 'rezvan-missile',
    catId: '4',
    name: 'Rezvan',
    featured: false,
    img: 'rezvan.jpg',
    model: 'rezvan.glb',
    dangerLevel: 8,
    threatType: 'Medium-range Ballistic Missile',
    specs: { range: '1,400 km', speed: 'Supersonic', generation: 'MRBM', country: 'Iran' }
  }
];
