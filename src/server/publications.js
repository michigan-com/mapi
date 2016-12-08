/* eslint-disable quote-props, no-param-reassign */

/* UTC Offsets for US time zones */
export const EST_OFFSET = 5;
export const CST_OFFSET = 6;
export const MST_OFFSET = 7;
export const PST_OFFSET = 8;

/* All Gannett regions */
export const ATLANTIC_REGION = 'Atlantic';
export const FLORIDA_REGION = 'Florida';
export const GULF_REGION = 'Gulf';
export const MIDWEST_REGION = 'Midwest';
export const NEW_JERSEY_REGION = 'New Jersey';
export const NORTHEAST_REGION = 'Northeast';
export const OHIO_REGION = 'Ohio';
export const PACIFIC_REGION = 'Pacific';
export const PLAINS_REGION = 'Plains';
export const SOUTHEAST_REGION = 'Southeast';
export const SOUTHWEST_REGION = 'Southwest';
export const TEXAS_REGION = 'Texas';
export const TENNESSEE_REGION = 'Tennessee';
export const WISCONSIN_REGION = 'Wisconsin';
export const USA_REGION = 'USA';

/* Map Gannet Region to UTC Offset. Used for time-relative queries. Alphabetized by region */
export const regionsOffsets = {
  // Eastern time
  [ATLANTIC_REGION]: EST_OFFSET,
  [MIDWEST_REGION]: EST_OFFSET,
  [FLORIDA_REGION]: EST_OFFSET,
  [NEW_JERSEY_REGION]: EST_OFFSET,
  [NORTHEAST_REGION]: EST_OFFSET,
  [OHIO_REGION]: EST_OFFSET,
  [SOUTHEAST_REGION]: EST_OFFSET,
  [USA_REGION]: EST_OFFSET,

  // Central time
  [GULF_REGION]: CST_OFFSET,
  [TENNESSEE_REGION]: CST_OFFSET,
  [TEXAS_REGION]: CST_OFFSET,
  [WISCONSIN_REGION]: CST_OFFSET,


  // Mountain time
  [PLAINS_REGION]: MST_OFFSET,
  [SOUTHWEST_REGION]: MST_OFFSET,

  // Pacific time
  [PACIFIC_REGION]: PST_OFFSET,
};

export const publicationList = {
  'alamogordonews': {
    'displayName': 'Alamogordo Daily News',
    'baseUrl': 'alamogordonews.com',
    'hostName': 'alamogordonews',
    'region': SOUTHWEST_REGION,
  },
  'app': {
    'displayName': 'Asbury Park Press',
    'baseUrl': 'app.com',
    'hostName': 'app',
    'region': NEW_JERSEY_REGION,
  },
  'argusleader': {
    'displayName': 'Argus Leader',
    'baseUrl': 'argusleader.com',
    'hostName': 'argusleader',
    'region': PLAINS_REGION,
  },
  'azcentral': {
    'displayName': 'azcentral',
    'baseUrl': 'azcentral.com',
    'hostName': 'azcentral',
    'region': SOUTHWEST_REGION,
  },
  'battlecreekenquirer': {
    'displayName': 'Battle Creek Enquirer',
    'baseUrl': 'battlecreekenquirer.com',
    'hostName': 'battlecreekenquirer',
    'region': MIDWEST_REGION,
  },
  'baxterbulletin': {
    'displayName': 'The Baxter Bulletin',
    'baseUrl': 'baxterbulletin.com',
    'hostName': 'baxterbulletin',
    'region': PLAINS_REGION,
  },
  'blackmountainnews': {
    'displayName': 'Black Mountain News',
    'baseUrl': 'blackmountainnews.com',
    'hostName': 'blackmountainnews',
    'region': SOUTHEAST_REGION,
  },
  'bucyrustelegraphforum': {
    'displayName': 'Bucyrus Telegraph',
    'baseUrl': 'bucyrustelegraphforum.com',
    'hostName': 'bucyrustelegraphforum',
    'region': OHIO_REGION,
  },
  'burlingtonfreepress': {
    'displayName': 'Burlington Free Press',
    'baseUrl': 'burlingtonfreepress.com',
    'hostName': 'burlingtonfreepress',
    'region': NORTHEAST_REGION,
  },
  'caller': {
    'displayName': 'Corpus Christi Caller-Times',
    'baseUrl': 'caller.com',
    'hostName': 'caller',
    'region': TEXAS_REGION,
  },
  'centralfloridafuture': {
    'displayName': 'Central Florida Future',
    'baseUrl': 'centralfloridafuture.com',
    'hostName': 'centralfloridafuture',
    'region': FLORIDA_REGION,
  },
  'chillicothegazette': {
    'displayName': 'Chillicothe Gazette',
    'baseUrl': 'chillicothegazette.com',
    'hostName': 'chillicothegazette',
    'region': OHIO_REGION,
  },
  'cincinnati': {
    'displayName': 'Cincinnati.com',
    'baseUrl': 'cincinnati.com',
    'hostName': 'cincinnati',
    'region': OHIO_REGION,
  },
  'citizen-times': {
    'displayName': 'Citizen Times',
    'baseUrl': 'citizen-times.com',
    'hostName': 'citizen-times',
    'region': SOUTHEAST_REGION,
  },
  'clarionledger': {
    'displayName': 'The Clarion Ledger',
    'baseUrl': 'clarionledger.com',
    'hostName': 'clarionledger',
    'region': GULF_REGION,
  },
  'coloradoan': {
    'displayName': 'Coloradoan',
    'baseUrl': 'coloradoan.com',
    'hostName': 'coloradoan',
    'region': PLAINS_REGION,
  },
  'commercialappeal': {
    'displayName': 'The Commercial Appeal',
    'baseUrl': 'commercialappeal.com',
    'hostName': 'commercialappeal',
    'region': TENNESSEE_REGION,
  },
  'coshoctontribune': {
    'displayName': 'Coshocton Tribune',
    'baseUrl': 'coshoctontribune.com',
    'hostName': 'coshoctontribune',
    'region': OHIO_REGION,
  },
  'courier-journal': {
    'displayName': 'The Courier-Journal',
    'baseUrl': 'courier-journal.com',
    'hostName': 'courier-journal',
    'region': MIDWEST_REGION,
  },
  'courierpostonline': {
    'displayName': 'Courier-Post',
    'baseUrl': 'courierpostonline.com',
    'hostName': 'courierpostonline',
    'region': NEW_JERSEY_REGION,
  },
  'courierpress': {
    'displayName': 'Evansville Courier & Press',
    'baseUrl': 'courierpress.com',
    'hostName': 'courierpress',
    'region': MIDWEST_REGION,
  },
  'currentargus': {
    'displayName': 'Carlsbad Current Argus',
    'baseUrl': 'currentargus.com',
    'hostName': 'currentargus',
    'region': SOUTHWEST_REGION,
  },
  'daily-times': {
    'displayName': 'Farmington Daily Times',
    'baseUrl': 'daily-times.com',
    'hostName': 'daily-times',
    'region': SOUTHWEST_REGION,
  },
  'dailyrecord': {
    'displayName': 'Daily Record',
    'baseUrl': 'dailyrecord.com',
    'hostName': 'dailyrecord',
    'region': NEW_JERSEY_REGION,
  },
  'dailyworld': {
    'displayName': 'DailyWorld.com',
    'baseUrl': 'dailyworld.com',
    'hostName': 'dailyworld',
    'region': GULF_REGION,
  },
  'delawarebeaches': {
    'displayName': 'Delaware Beaches',
    'baseUrl': 'delawarebeaches.com',
    'hostName': 'delawarebeaches',
    'region': ATLANTIC_REGION,
  },
  'delawareonline': {
    'displayName': 'delawareonline',
    'baseUrl': 'delawareonline.com',
    'hostName': 'delawareonline',
    'region': ATLANTIC_REGION,
  },
  'delmarvanow': {
    'displayName': 'Delmarva Daily Times',
    'baseUrl': 'delmarvanow.com',
    'hostName': 'delmarvanow',
    'region': ATLANTIC_REGION,
  },
  'demingheadlight': {
    'displayName': 'The Deming Headlight',
    'baseUrl': 'demingheadlight.com',
    'hostName': 'demingheadlight',
    'region': SOUTHWEST_REGION,
  },
  'democratandchronicle': {
    'displayName': 'Rochester Democrat and Chronicle',
    'baseUrl': 'democratandchronicle.com',
    'hostName': 'democratandchronicle',
    'region': NORTHEAST_REGION,
  },
  'desertsun': {
    'displayName': 'Desert Sun',
    'baseUrl': 'desertsun.com',
    'hostName': 'desertsun',
    'region': PACIFIC_REGION,
  },
  'desmoinesregister': {
    'displayName': 'Des Moines Register',
    'baseUrl': 'desmoinesregister.com',
    'hostName': 'desmoinesregister',
    'region': PLAINS_REGION,
  },
  'detroitnews': {
    'displayName': 'Detroit News',
    'baseUrl': 'detroitnews.com',
    'hostName': 'detroitnews',
    'region': MIDWEST_REGION,
  },
  'dmjuice': {
    'displayName': 'Juice',
    'baseUrl': 'dmjuice.com',
    'hostName': 'dmjuice',
    'region': PLAINS_REGION,
  },
  'dnj': {
    'displayName': 'DNJ',
    'baseUrl': 'dnj.com',
    'hostName': 'dnj',
    'region': TENNESSEE_REGION,
  },
  'elpasotimes': {
    'displayName': 'El Paso Times',
    'baseUrl': 'elpasotimes.com',
    'hostName': 'elpasotimes',
    'region': TEXAS_REGION,
  },
  'elpasoymas': {
    'displayName': 'El Paso y Más',
    'baseUrl': 'elpasoymas.com',
    'hostName': 'elpasoymas',
    'region': TEXAS_REGION,
  },
  'eveningsun': {
    'displayName': 'The Evening Sun',
    'baseUrl': 'eveningsun.com',
    'hostName': 'eveningsun',
    'region': ATLANTIC_REGION,
  },
  'fdlreporter': {
    'displayName': 'Action Reporter Media',
    'baseUrl': 'fdlreporter.com',
    'hostName': 'fdlreporter',
    'region': WISCONSIN_REGION,
  },
  'flipsidepa': {
    'displayName': 'FlipSidePA',
    'baseUrl': 'flipsidepa.com',
    'hostName': 'flipsidepa',
    'region': ATLANTIC_REGION,
  },
  'floridatoday': {
    'displayName': 'Florida Today',
    'baseUrl': 'floridatoday.com',
    'hostName': 'floridatoday',
    'region': FLORIDA_REGION,
  },
  'freep': {
    'displayName': 'Detroit Free Press',
    'baseUrl': 'freep.com',
    'hostName': 'freep',
    'region': MIDWEST_REGION,
  },
  'fsunews': {
    'displayName': 'FSView & Florida Flambeau',
    'baseUrl': 'fsunews.com',
    'hostName': 'fsunews',
    'region': FLORIDA_REGION,
  },
  'gametimepa': {
    'displayName': 'GameTimePA',
    'baseUrl': 'gametimepa.com',
    'hostName': 'gametimepa',
    'region': ATLANTIC_REGION,
  },
  'greatfallstribune': {
    'displayName': 'Great Falls Tribune',
    'baseUrl': 'greatfallstribune.com',
    'hostName': 'greatfallstribune',
    'region': PLAINS_REGION,
  },
  'greenbaypressgazette': {
    'displayName': 'Press Gazette Media',
    'baseUrl': 'greenbaypressgazette.com',
    'hostName': 'greenbaypressgazette',
    'region': WISCONSIN_REGION,
  },
  'greenvilleonline': {
    'displayName': 'The Greenville News',
    'baseUrl': 'greenvilleonline.com',
    'hostName': 'greenvilleonline',
    'region': SOUTHEAST_REGION,
  },
  'guampdn': {
    'displayName': 'Pacific Daily News',
    'baseUrl': 'guampdn.com',
    'hostName': 'guampdn',
    'region': PACIFIC_REGION,
  },
  'hattiesburgamerican': {
    'displayName': 'Hattiesburg American',
    'baseUrl': 'hattiesburgamerican.com',
    'hostName': 'hattiesburgamerican',
    'region': GULF_REGION,
  },
  'hawkcentral': {
    'displayName': 'Hawk Central',
    'baseUrl': 'hawkcentral.com',
    'hostName': 'hawkcentral',
    'region': PLAINS_REGION,
  },
  'hometownlife': {
    'displayName': 'HometownLife',
    'baseUrl': 'hometownlife.com',
    'hostName': 'hometownlife',
    'region': MIDWEST_REGION,
  },
  'htrnews': {
    'displayName': 'HTR Media',
    'baseUrl': 'htrnews.com',
    'hostName': 'htrnews',
    'region': WISCONSIN_REGION,
  },
  'independentmail': {
    'displayName': 'Independent Mail',
    'baseUrl': 'independentmail.com',
    'hostName': 'independentmail',
    'region': SOUTHEAST_REGION,
  },
  'indystar': {
    'displayName': 'Indianapolis Star',
    'baseUrl': 'indystar.com',
    'hostName': 'indystar',
    'region': MIDWEST_REGION,
  },
  'ithacajournal': {
    'displayName': 'Ithaca Journal',
    'baseUrl': 'ithacajournal.com',
    'hostName': 'ithacajournal',
    'region': NORTHEAST_REGION,
  },
  'jacksonsun': {
    'displayName': 'The Jackson Sun',
    'baseUrl': 'jacksonsun.com',
    'hostName': 'jacksonsun',
    'region': TENNESSEE_REGION,
  },
  'jconline': {
    'displayName': 'Journal and Courier',
    'baseUrl': 'jconline.com',
    'hostName': 'jconline',
    'region': MIDWEST_REGION,
  },
  'jsonline': {
    'displayName': 'Milwaukee Journal Sentinel',
    'baseUrl': 'jsonline.com',
    'hostName': 'jsonline',
    'region': WISCONSIN_REGION,
  },
  'knoxnews': {
    'displayName': 'Knoxville News Sentinel',
    'baseUrl': 'knoxnews.com',
    'hostName': 'knoxnews',
    'region': TENNESSEE_REGION,
  },
  'lakecountrynow': {
    'displayName': 'Lake Country Now',
    'baseUrl': 'lakecountrynow.com',
    'hostName': 'lakecountrynow',
    'region': WISCONSIN_REGION,
  },
  'lancastereaglegazette': {
    'displayName': 'Lancaster Eagle Gazette',
    'baseUrl': 'lancastereaglegazette.com',
    'hostName': 'lancastereaglegazette',
    'region': OHIO_REGION,
  },
  'lansingstatejournal': {
    'displayName': 'Lansing State Journal',
    'baseUrl': 'lansingstatejournal.com',
    'hostName': 'lansingstatejournal',
    'region': MIDWEST_REGION,
  },
  'lavozarizona': {
    'displayName': 'Lavoz',
    'baseUrl': 'lavozarizona.com',
    'hostName': 'lavozarizona',
    'region': SOUTHWEST_REGION,
  },
  'lcsun-news': {
    'displayName': 'Las Cruces Sun-News',
    'baseUrl': 'lcsun-news.com',
    'hostName': 'lcsun-news',
    'region': SOUTHWEST_REGION,
  },
  'ldnews': {
    'displayName': 'Lebanon Daily News',
    'baseUrl': 'ldnews.com',
    'hostName': 'ldnews',
    'region': ATLANTIC_REGION,
  },
  'livingstondaily': {
    'displayName': 'Livingston Daily Press & Argus',
    'baseUrl': 'livingstondaily.com',
    'hostName': 'livingstondaily',
    'region': MIDWEST_REGION,
  },
  'lohud': {
    'displayName': 'lohud.com',
    'baseUrl': 'lohud.com',
    'hostName': 'lohud',
    'region': NORTHEAST_REGION,
  },
  'mansfieldnewsjournal': {
    'displayName': 'Mansfield News Journal',
    'baseUrl': 'mansfieldnewsjournal.com',
    'hostName': 'mansfieldnewsjournal',
    'region': OHIO_REGION,
  },
  'marcoislandflorida': {
    'displayName': 'Marco Island Sun Times',
    'baseUrl': 'marcoislandflorida.com',
    'hostName': 'marcoislandflorida',
    'region': FLORIDA_REGION,
  },
  'marionstar': {
    'displayName': 'Marion Star',
    'baseUrl': 'marionstar.com',
    'hostName': 'marionstar',
    'region': OHIO_REGION,
  },
  'marshfieldnewsherald': {
    'displayName': 'News-Herald Media',
    'baseUrl': 'marshfieldnewsherald.com',
    'hostName': 'marshfieldnewsherald',
    'region': WISCONSIN_REGION,
  },
  'metroparentmagazine': {
    'displayName': 'Metro Parent Magazine',
    'baseUrl': 'metroparentmagazine.com',
    'hostName': 'metroparentmagazine',
    'region': WISCONSIN_REGION,
  },
  'montgomeryadvertiser': {
    'displayName': 'The Montgomery Advertiser',
    'baseUrl': 'montgomeryadvertiser.com',
    'hostName': 'montgomeryadvertiser',
    'region': GULF_REGION,
  },
  'mycentraljersey': {
    'displayName': 'MY CENTRAL JERSEY',
    'baseUrl': 'mycentraljersey.com',
    'hostName': 'mycentraljersey',
    'region': NEW_JERSEY_REGION,
  },
  'mynorthshorenow': {
    'displayName': 'My North Shore Now',
    'baseUrl': 'mynorthshorenow.com',
    'hostName': 'mynorthshorenow',
    'region': WISCONSIN_REGION,
  },
  'naplesnews': {
    'displayName': 'Naples Daily News',
    'baseUrl': 'naplesnews.com',
    'hostName': 'naplesnews',
    'region': FLORIDA_REGION,
  },
  'newarkadvocate': {
    'displayName': 'The Newark Advocate',
    'baseUrl': 'newarkadvocate.com',
    'hostName': 'newarkadvocate',
    'region': OHIO_REGION,
  },
  'news-leader': {
    'displayName': 'Springfield News-Leader',
    'baseUrl': 'news-leader.com',
    'hostName': 'news-leader',
    'region': PLAINS_REGION,
  },
  'news-press': {
    'displayName': 'The News-Press',
    'baseUrl': 'news-press.com',
    'hostName': 'news-press',
    'region': FLORIDA_REGION,
  },
  'newsleader': {
    'displayName': 'The News Leader',
    'baseUrl': 'newsleader.com',
    'hostName': 'newsleader',
    'region': SOUTHEAST_REGION,
  },
  'northjersey': {
    'displayName': 'North Jersey',
    'baseUrl': 'northjersey.com',
    'hostName': 'northjersey',
    'region': NEW_JERSEY_REGION,
  },
  'packersnews': {
    'displayName': 'Packers News',
    'baseUrl': 'packersnews.com',
    'hostName': 'packersnews',
    'region': WISCONSIN_REGION,
  },
  'pal-item': {
    'displayName': 'Pal-Item',
    'baseUrl': 'pal-item.com',
    'hostName': 'pal-item',
    'region': MIDWEST_REGION,
  },
  'pnj': {
    'displayName': 'Pensacola News Journal',
    'baseUrl': 'pnj.com',
    'hostName': 'pnj',
    'region': FLORIDA_REGION,
  },
  'portclintonnewsherald': {
    'displayName': 'Port Clinton News Herald',
    'baseUrl': 'portclintonnewsherald.com',
    'hostName': 'portclintonnewsherald',
    'region': OHIO_REGION,
  },
  'postcrescent': {
    'displayName': 'Post-Crescent Media',
    'baseUrl': 'postcrescent.com',
    'hostName': 'postcrescent',
    'region': WISCONSIN_REGION,
  },
  'poughkeepsiejournal': {
    'displayName': 'The Poughkeepsie Journal',
    'baseUrl': 'poughkeepsiejournal.com',
    'hostName': 'poughkeepsiejournal',
    'region': NORTHEAST_REGION,
  },
  'press-citizen': {
    'displayName': 'Iowa City Press-Citizen',
    'baseUrl': 'press-citizen.com',
    'hostName': 'press-citizen',
    'region': PLAINS_REGION,
  },
  'pressconnects': {
    'displayName': 'Pressconnects',
    'baseUrl': 'pressconnects.com',
    'hostName': 'pressconnects',
    'region': NORTHEAST_REGION,
  },
  'publicopiniononline': {
    'displayName': 'Public Opinion Online',
    'baseUrl': 'publicopiniononline.com',
    'hostName': 'publicopiniononline',
    'region': ATLANTIC_REGION,
  },
  'reno': {
    'displayName': 'Reno.com',
    'baseUrl': 'reno.com',
    'hostName': 'reno',
    'region': PACIFIC_REGION,
  },
  'rgj': {
    'displayName': 'Reno Gazette Journal',
    'baseUrl': 'rgj.com',
    'hostName': 'rgj',
    'region': PACIFIC_REGION,
  },
  'ruidosonews': {
    'displayName': 'Ruidoso News',
    'baseUrl': 'ruidosonews.com',
    'hostName': 'ruidosonews',
    'region': SOUTHWEST_REGION,
  },
  'scsun-news': {
    'displayName': 'Silver City Sun-News',
    'baseUrl': 'scsun-news.com',
    'hostName': 'scsun-news',
    'region': SOUTHWEST_REGION,
  },
  'sctimes': {
    'displayName': 'St. Cloud Times',
    'baseUrl': 'sctimes.com',
    'hostName': 'sctimes',
    'region': PLAINS_REGION,
  },
  'sheboyganpress': {
    'displayName': 'Sheboygan Press Media',
    'baseUrl': 'sheboyganpress.com',
    'hostName': 'sheboyganpress',
    'region': WISCONSIN_REGION,
  },
  'shreveporttimes': {
    'displayName': 'shreveporttimes.com',
    'baseUrl': 'shreveporttimes.com',
    'hostName': 'shreveporttimes',
    'region': GULF_REGION,
  },
  'stargazette': {
    'displayName': 'Elmira Star-Gazette',
    'baseUrl': 'stargazette.com',
    'hostName': 'stargazette',
    'region': NORTHEAST_REGION,
  },
  'statesmanjournal': {
    'displayName': 'Statesman Journal',
    'baseUrl': 'statesmanjournal.com',
    'hostName': 'statesmanjournal',
    'region': PACIFIC_REGION,
  },
  'stevenspointjournal': {
    'displayName': 'Stevens Point Journal Media',
    'baseUrl': 'stevenspointjournal.com',
    'hostName': 'stevenspointjournal',
    'region': WISCONSIN_REGION,
  },
  'tallahassee': {
    'displayName': 'Tallahassee Democrat',
    'baseUrl': 'tallahassee.com',
    'hostName': 'tallahassee',
    'region': FLORIDA_REGION,
  },
  'tcpalm': {
    'displayName': 'TCPalm',
    'baseUrl': 'tcpalm.com',
    'hostName': 'tcpalm',
    'region': FLORIDA_REGION,
  },
  'tennessean': {
    'displayName': 'The Tennessean',
    'baseUrl': 'tennessean.com',
    'hostName': 'tennessean',
    'region': TENNESSEE_REGION,
  },
  'theadvertiser': {
    'displayName': 'The Advertiser',
    'baseUrl': 'theadvertiser.com',
    'hostName': 'theadvertiser',
    'region': GULF_REGION,
  },
  'thecalifornian': {
    'displayName': 'The Salinas Californian',
    'baseUrl': 'thecalifornian.com',
    'hostName': 'thecalifornian',
    'region': PACIFIC_REGION,
  },
  'thedailyjournal': {
    'displayName': 'The Daily Journal',
    'baseUrl': 'thedailyjournal.com',
    'hostName': 'thedailyjournal',
    'region': NEW_JERSEY_REGION,
  },
  'thegleaner': {
    'displayName': 'The Gleaner',
    'baseUrl': 'thegleaner.com',
    'hostName': 'thegleaner',
    'region': MIDWEST_REGION,
  },
  'thehammontonnews': {
    'displayName': 'The Hammonton News',
    'baseUrl': 'thehammontonnews.com',
    'hostName': 'thehammontonnews',
    'region': NEW_JERSEY_REGION,
  },
  'theleafchronicle': {
    'displayName': 'The Leaf Chronicle',
    'baseUrl': 'theleafchronicle.com',
    'hostName': 'theleafchronicle',
    'region': TENNESSEE_REGION,
  },
  'thenews-messenger': {
    'displayName': 'The News-Messenger',
    'baseUrl': 'thenews-messenger.com',
    'hostName': 'thenews-messenger',
    'region': OHIO_REGION,
  },
  'thenewsstar': {
    'displayName': 'thenewsstar.com',
    'baseUrl': 'thenewsstar.com',
    'hostName': 'thenewsstar',
    'region': GULF_REGION,
  },
  'thenorthwestern': {
    'displayName': 'Northwestern Media',
    'baseUrl': 'thenorthwestern.com',
    'hostName': 'thenorthwestern',
    'region': WISCONSIN_REGION,
  },
  'thespectrum': {
    'displayName': 'The Spectrum & Daily News',
    'baseUrl': 'thespectrum.com',
    'hostName': 'thespectrum',
    'region': SOUTHWEST_REGION,
  },
  'thestarpress': {
    'displayName': 'TheStarPress',
    'baseUrl': 'thestarpress.com',
    'hostName': 'thestarpress',
    'region': MIDWEST_REGION,
  },
  'thetimesherald': {
    'displayName': 'The Times Herald',
    'baseUrl': 'thetimesherald.com',
    'hostName': 'thetimesherald',
    'region': MIDWEST_REGION,
  },
  'thetowntalk': {
    'displayName': 'thetowntalk.com',
    'baseUrl': 'thetowntalk.com',
    'hostName': 'thetowntalk',
    'region': GULF_REGION,
  },
  'upstateparent': {
    'displayName': 'Upstate Parent',
    'baseUrl': 'upstateparent.com',
    'hostName': 'upstateparent',
    'region': SOUTHEAST_REGION,
  },
  'usatoday': {
    'displayName': 'USA TODAY',
    'baseUrl': 'usatoday.com',
    'hostName': 'usatoday',
    'region': USA_REGION,
  },
  'vcstar': {
    'displayName': 'Ventura County Star',
    'baseUrl': 'vcstar.com',
    'hostName': 'vcstar',
    'region': PACIFIC_REGION,
  },
  'visaliatimesdelta': {
    'displayName': 'Visalia Times-Delta and Tulare Advance-Register',
    'baseUrl': 'visaliatimesdelta.com',
    'hostName': 'visaliatimesdelta',
    'region': PACIFIC_REGION,
  },
  'waukeshanow': {
    'displayName': 'Waukesha Now',
    'baseUrl': 'waukeshanow.com',
    'hostName': 'waukeshanow',
    'region': WISCONSIN_REGION,
  },
  'wausaudailyherald': {
    'displayName': 'Daily Herald Media',
    'baseUrl': 'wausaudailyherald.com',
    'hostName': 'wausaudailyherald',
    'region': WISCONSIN_REGION,
  },
  'wauwatosanow': {
    'displayName': 'Wauwatosa Now',
    'baseUrl': 'wauwatosanow.com',
    'hostName': 'wauwatosanow',
    'region': WISCONSIN_REGION,
  },
  'wisconsinrapidstribune': {
    'displayName': 'Daily Tribune Media',
    'baseUrl': 'wisconsinrapidstribune.com',
    'hostName': 'wisconsinrapidstribune',
    'region': WISCONSIN_REGION,
  },
  'wisfarmer': {
    'displayName': 'Wisconsin State Farmer',
    'baseUrl': 'wisfarmer.com',
    'hostName': 'wisfarmer',
    'region': WISCONSIN_REGION,
  },
  'ydr': {
    'displayName': 'The York Daily Record',
    'baseUrl': 'ydr.com',
    'hostName': 'ydr',
    'region': ATLANTIC_REGION,
  },
  'yorkdispatch': {
    'displayName': 'York Dispatch',
    'baseUrl': 'yorkdispatch.com',
    'hostName': 'yorkdispatch',
    'region': ATLANTIC_REGION,
  },
  'zanesvilletimesrecorder': {
    'displayName': 'Zanesville Times Recorder',
    'baseUrl': 'zanesvilletimesrecorder.com',
    'hostName': 'zanesvilletimesrecorder',
    'region': OHIO_REGION,
  },
};
