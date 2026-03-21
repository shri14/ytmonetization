/**
 * plans-data.js
 * Shared plan data layer — reads from localStorage (set by admin panel).
 * Falls back to hardcoded defaults if admin hasn't saved anything yet.
 */

const DATA_KEY = 'ytm_plans_v1';

const DEFAULT_PLANS = [
  {id:'yt-starter',    platform:'YouTube',   name:'YouTube Starter',      price:299,  billing:'one-time payment',start:'5 Minutes', delivery:'24 Hours',  service:'500 Subs + 1,000 Watch Hours + 5K Views',          popular:false,features:['500 Subscribers','1,000 Watch Hours','5,000 Video Views','Lifetime Guarantee','No Priority Support','No Monetization Bundle']},
  {id:'yt-growth',     platform:'YouTube',   name:'YouTube Growth',       price:799,  billing:'one-time payment',start:'5 Minutes', delivery:'48 Hours',  service:'1,000 Subs + 4,000 Watch Hours + 10K Views',       popular:true, features:['1,000 Subscribers','4,000 Watch Hours','10,000 Video Views','Lifetime Guarantee','Priority Support','No Monetization Bundle']},
  {id:'yt-pro',        platform:'YouTube',   name:'YouTube Pro Bundle',   price:1499, billing:'one-time payment',start:'10 Minutes',delivery:'72 Hours',  service:'2,000+ Subs + 4,000+ Watch Hours + 25K Views',     popular:false,features:['2,000+ Subscribers','4,000+ Watch Hours','25,000+ Video Views','Lifetime Guarantee','Priority Support','Full Monetization Bundle']},
  {id:'ig-basic',      platform:'Instagram', name:'Instagram Basic',      price:199,  billing:'one-time payment',start:'5 Minutes', delivery:'20 Minutes',service:'1,000 Indian Followers + 500 Post Likes',          popular:false,features:['1,000 Indian Followers','500 Post Likes','Non-Drop Quality','Lifetime Support','No Priority Support','No Reel Boost']},
  {id:'ig-influencer', platform:'Instagram', name:'Instagram Influencer', price:599,  billing:'one-time payment',start:'5 Minutes', delivery:'2 Hours',   service:'5,000 Followers + 2,000 Likes + Reel Boost',      popular:true, features:['5,000 Followers','2,000 Post Likes','Reel Views Boost','Non-Drop Quality','Priority Support','No Story Boost']},
  {id:'ig-brand',      platform:'Instagram', name:'Instagram Brand',      price:1199, billing:'one-time payment',start:'10 Minutes',delivery:'6 Hours',   service:'10,000 Followers + 5K Likes + Full Reel Boost',    popular:false,features:['10,000 Followers','5,000 Post Likes','Full Reel Boost','Comments Package','Priority Support','Lifetime Guarantee']},
  {id:'fb-starter',    platform:'Facebook',  name:'Facebook Starter',     price:249,  billing:'one-time payment',start:'5 Minutes', delivery:'30 Minutes',service:'500 Page Followers + 10K Watch Minutes',           popular:false,features:['500 Page Followers','10,000 Watch Minutes','Real Indian Users','Lifetime Support','No Priority Support','No Post Boost']},
  {id:'fb-pro',        platform:'Facebook',  name:'Facebook Page Pro',    price:699,  billing:'one-time payment',start:'5 Minutes', delivery:'3 Hours',   service:'2,000 Followers + 60K Watch Minutes + Post Bundle',popular:true, features:['2,000 Page Followers','60,000 Watch Minutes','Post Engagement Bundle','Priority Support','Lifetime Guarantee','No Story Boost']},
  {id:'fb-enterprise', platform:'Facebook',  name:'Facebook Enterprise',  price:1799, billing:'one-time payment',start:'10 Minutes',delivery:'12 Hours',  service:'5,000 Followers + 100K Watch Minutes + Engagement', popular:false,features:['5,000 Page Followers','100,000 Watch Minutes','Full Engagement Package','Story Boost Included','Priority Support','Lifetime Guarantee']},
];

/** Returns current plans from localStorage or defaults */
function getPlans() {
  try {
    const stored = localStorage.getItem(DATA_KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_PLANS));
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_PLANS));
  }
}

/** Returns a single plan by id */
function getPlanById(id) {
  return getPlans().find(p => p.id === id) || null;
}
