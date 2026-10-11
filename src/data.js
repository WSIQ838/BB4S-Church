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
  giveUrl: "https://bb4square.org/give",
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
    verse: "Let the little children come to me, and do not hinder them. — Matthew 19:14",
    blurb: "A warm, safe place for kids to grow in faith. A nursery is open every Sunday, and Littles & Middles (pre-K to 8th grade) meets every Sunday except the first of the month.",
    when: "Sundays during the 11 am service",
  },
  {
    id: "men",
    title: "Men's Ministry",
    verse: "Welcome one another as Christ has welcomed you. — Romans 15:7",
    blurb: "Men of Power: Victory Through Surrender. Open to everyone, whether you're new to the faith or a longtime believer. Join with Pastor Jeff in person or online.",
    when: "Every other Wednesday, 7 pm · Zoom & Social Hall",
  },
  {
    id: "ladies",
    title: "Ladies Ministry",
    verse: "A woman who fears the Lord is to be praised. — Proverbs 31:30",
    blurb: "Encouragement, friendship and prayer support for women of every age and stage, with in-person and online Bible studies, including Women of the Word.",
    when: "Tuesdays, 10 am · Church Social Hall",
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
