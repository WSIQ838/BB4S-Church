// Content carried over from the old bb4square.org site.
// Later this moves into Base44 entities so staff can edit it without code.

export const church = {
  name: "Beverly Boulevard Foursquare Church",
  short: "Beverly Blvd. Foursquare",
  tagline: "Preaching the Gospel of Jesus Christ",
  mission: "Ministering to the Lord · to the Saints · to the World",
  address: ["1901 W. Beverly Blvd.", "Montebello, CA 90640"],
  mapUrl: "https://www.google.com/maps/search/?api=1&query=1901+W.+Beverly+Blvd.+Montebello+CA+90640",
  phone: "(323) 728-5336",
  email: "info@bb4square.org",
  office: "Monday to Thursday, 10 am to 6 pm",
  textGive: { word: "GIVE", number: "(844) 945-2304" },
  giveUrl: "https://give.tithe.ly/?locationId=2c27cad7-96bb-4a55-acb7-85391d79a755&giveButtonText=Give%20Online%20Now",
  liveUrl: "https://bb4square.org/live",
};

export const services = [
  { time: "10:00 AM", name: "Adult Bible Study", note: "Start your Sunday in the Word" },
  { time: "11:00 AM", name: "Main Service", note: "Worship, prayer and Bible-centered teaching" },
  { time: "11:00 AM", name: "Littles & Middles", note: "Pre-K to 8th grade, except the first Sunday of the month" },
];

export const sermons = [
  { title: "Drinking Our Cup", date: "2026-10-04", speaker: "Enrique Zone", series: "Sunday Worship" },
  { title: "Cure for Silent Suffering", date: "2026-09-27", speaker: "Enrique Zone", series: "Sunday Worship" },
  { title: "Wired for Community", date: "2026-09-20", speaker: "Jeff Zone", series: "Sunday Worship" },
  { title: "Eat and Drink", date: "2026-08-02", speaker: "", series: "Sunday Worship" },
  { title: "The Comforter", date: "2026-05-31", speaker: "", series: "Sunday Worship" },
  { title: "Get in the Wheelbarrow", date: "2026-03-15", speaker: "", series: "Sunday Worship" },
  { title: "A Call to Joy", date: "2026-01-25", speaker: "", series: "Developing a Culture of Joy" },
  { title: "I Pity the Fool", date: "2024-08-04", speaker: "", series: "Sunday Worship" },
];

export const events = [
  { title: "Sunday Morning Worship Service", date: "2026-10-11", time: "11:00 AM", place: "Main Sanctuary" },
  { title: "Littles & Middles", date: "2026-10-11", time: "11:00 AM", place: "Pre-K to 8th Grade" },
  { title: "Tuesday Ladies Bible Study", date: "2026-10-13", time: "10:00 AM", place: "Church Social Hall" },
  { title: "Men of Power", date: "2026-10-14", time: "7:00 PM", place: "Zoom & Social Hall" },
  { title: "Sunday Call to Prayer", date: "2026-10-18", time: "10:30 AM", place: "Beverly Blvd. Foursquare Church" },
  { title: "Join us this week in the Bible YouVersion App", date: "2026-10-19", time: "All week", place: "Online" },
];

export const ministries = [
  {
    id: "children",
    title: "Children's Ministry",
    tagline: "Welcome to our Children's Ministry Group!",
    scripture: { text: "Jesus said, \u201cLet the little children come to me, and do not hinder them, for the kingdom of heaven belongs to such as these.\u201d", ref: "Matthew 19:14" },
    verse: "Let the little children come to me, and do not hinder them. \u2014 Matthew 19:14",
    blurb: "A warm, safe place for kids to grow in faith. A nursery is open every Sunday, and Littles & Middles (pre-K to 8th grade) meets every Sunday except the first of the month.",
    when: "Sundays during the 11 am service",
    about: [
      "Here at our church, we create a warm and inviting environment for children to grow in their faith and develop meaningful friendships. Our dedicated nursery program is available every Sunday during service, ensuring even our youngest members feel loved and cared for.",
      "For children in pre-K through 8th grade, we offer our Littles and Middles program, which meets every Sunday except the first Sunday of the month. Each class is designed to engage young hearts and minds with the teachings of the Lord, fostering a deep understanding of His Word.",
      "We believe in the importance of community, and through shared lessons and activities, our youth can form lasting connections with one another as they explore their faith together. Join us as we prioritize the teachings of Christ and build a vibrant, supportive space for our children to learn and grow!",
      "Keep checking for events in Children's Ministry!",
    ],
    schedule: [
      ["Nursery", "Every Sunday during the service"],
      ["Littles & Middles", "Sundays, 11:00 AM \u2013 12:30 PM, except the first Sunday of the month"],
      ["Ages", "Pre-K to 8th grade"],
    ],
    match: ["littles"],
  },
  {
    id: "men",
    title: "Men's Ministry",
    tagline: "Victory Through Surrender",
    scripture: { text: "Therefore welcome one another as Christ has welcomed you, for the glory of God.", ref: "Romans 15:7" },
    verse: "Welcome one another as Christ has welcomed you. \u2014 Romans 15:7",
    blurb: "Men of Power: Victory Through Surrender. Open to everyone, whether you're new to the faith or a longtime believer. Join with Pastor Jeff in person or online.",
    when: "Every other Wednesday, 7 pm \u00b7 Zoom & Social Hall",
    about: [
      "Join the men of Beverly Boulevard Foursquare Church as we grow together in God's Word and encourage one another in our walk with Christ. Our Men's Bible Study meets every other Wednesday at 7pm and is open to everyone in our community, whether you're new to the faith, a longtime believer, or simply looking for a place to belong and grow in your faith.",
      "Attend in person or online as we explore Scripture, build meaningful relationships, and discover what it means to experience true Victory Through Surrender.",
      "We'd love to have you join us!",
    ],
    schedule: [
      ["Men of Power", "Every other Wednesday, 7:00 \u2013 8:00 PM"],
      ["Where", "Zoom & the Church Social Hall"],
      ["Led by", "Pastor Jeff"],
    ],
    match: ["men of power"],
  },
  {
    id: "ladies",
    title: "Ladies Ministry",
    tagline: "Women of the Word: Philippians",
    scripture: { text: "Charm is deceptive, and beauty is fleeting; but a woman who fears the Lord is to be praised.", ref: "Proverbs 31:30" },
    verse: "A woman who fears the Lord is to be praised. \u2014 Proverbs 31:30",
    blurb: "Encouragement, friendship and prayer support for women of every age and stage, with in-person and online Bible studies, including Women of the Word.",
    when: "Tuesdays, 10 am \u00b7 Church Social Hall",
    about: [
      "Our Women's Ministry is a place where women of all ages and stages of life can find encouragement, authentic friendship, and a deeper relationship with God. Whether you're new to Bible study or have been walking with Christ for years, you'll find a welcoming community ready to grow alongside you.",
      "We offer Tuesday morning Bible studies, online Bible studies for those who prefer to connect from home, and personal prayer support, because we believe no one should walk through life's joys and challenges alone. Stay tuned for Women's Breakfast events to come!",
    ],
    schedule: [
      ["Tuesday Ladies Bible Study", "Tuesdays, 10:00 \u2013 11:00 AM"],
      ["Where", "Church Social Hall"],
      ["Online", "Women of the Word Online Bible Study"],
    ],
    news: { title: "Sign up now for Women of the Word Online Bible Study!", note: "Ask Jennifer Villasenor for more information." },
    match: ["ladies"],
  },
];

export const team = [
  { name: "Enrique Zone", role: "Senior Pastor" },
  { name: "Jeff Zone", role: "Lead Pastor / Worship" },
  { name: "Andrew Couch", role: "Associate Pastor & Chaplain" },
  { name: "Ralph Rivas", role: "Council Member" },
  { name: "Fernando Rosales", role: "Council Member" },
  { name: "Mike Figueroa", role: "Council Member" },
];

export const beliefs = [
  "The Bible is our foundation.",
  "There is one God, eternally existent in three persons: Father, Son and Holy Spirit.",
  "Through personal faith in Jesus Christ a person is forgiven by God and receives eternal life.",
  "Foursquare describes the four phases of Christ's ministry: Savior, Baptizer with the Holy Spirit, Healer and Soon-Coming King.",
];
