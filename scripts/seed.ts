
import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { serviceAccount } from './serviceAccountKey'; 
import { productCategories, serviceCategories } from '../src/lib/categories';
import { placeholderImages } from '../src/lib/placeholder-images.json';

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();

// --- Helper Functions ---
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const findImage = (id: string) => placeholderImages.find(img => img.id === id)?.imageUrl || '';

// --- Data Definitions ---
const usersToCreate = [
    { 
        uid: 'user_1',
        displayName: 'Alice Johnson', 
        email: 'alice@example.com',
        photoURL: findImage('avatar-2'),
        skills: ['Graphic Design', 'Logo Design', 'Illustration'],
        about: 'Creative graphic designer with over 5 years of experience in branding and digital art.'
    },
    { 
        uid: 'user_2',
        displayName: 'Bob Williams', 
        email: 'bob@example.com',
        photoURL: findImage('avatar-3'),
        skills: ['Web Development', 'React', 'Node.js', 'Firebase'],
        about: 'Full-stack developer passionate about building modern web applications.'
    },
    { 
        uid: 'user_3',
        displayName: 'Charlie Brown', 
        email: 'charlie@example.com',
        photoURL: findImage('avatar-4'),
        skills: ['Gardening', 'Landscaping', 'Plant Care'],
        about: 'Experienced gardener offering services to beautify your outdoor spaces.'
    },
    {
        uid: 'user_4',
        displayName: 'Diana Miller',
        email: 'diana@example.com',
        photoURL: findImage('avatar-5'),
        skills: ['Pet Sitting', 'Dog Walking'],
        about: 'Animal lover providing reliable and caring pet sitting services.'
    },
    {
        uid: 'user_5',
        displayName: 'Emily Davis',
        email: 'emily@example.com',
        photoURL: findImage('avatar-1'),
        skills: ['Mathematics', 'Physics', 'Private Tutoring'],
        about: 'University student offering tutoring in math and physics for high school students.'
    }
];

const listingsToCreate = [
  {
    title: 'Modern Logo Design for a Tech Startup',
    description: 'We are a new tech startup in need of a clean, modern, and memorable logo. We are looking for a designer who can create a brand identity that reflects our innovative spirit. Please provide a portfolio of your previous logo work.',
    budget: 500,
    category: getRandomItem(productCategories),
    location: 'Remote',
    imageUrls: [findImage('listing-1')],
  },
  {
    title: 'Garden Maintenance and Landscaping',
    description: 'My backyard is in need of some serious TLC. I need someone to handle regular mowing, weeding, and general maintenance. I am also interested in landscaping ideas to make the space more beautiful and functional.',
    budget: 300,
    category: getRandomItem(serviceCategories),
    location: 'San Francisco, CA',
    imageUrls: [findImage('listing-2')],
  },
  {
    title: 'Build a Simple E-commerce Website',
    description: 'I need a developer to build a simple e-commerce website for my small business. The site should have a product catalog, a shopping cart, and a secure checkout process. Experience with Shopify or WooCommerce is a plus.',
    budget: 2000,
    category: getRandomItem(serviceCategories),
    location: 'Remote',
    imageUrls: [findImage('listing-3')],
  },
  {
    title: 'High School Math Tutor Needed',
    description: 'My son is struggling with algebra and geometry. I am looking for an experienced tutor who can help him improve his grades and build his confidence in math. Sessions would be twice a week, preferably in the evenings.',
    budget: 50,
    category: getRandomItem(serviceCategories),
    location: 'New York, NY',
    imageUrls: [findImage('listing-4')],
  },
  {
    title: 'Pet Sitter for a Weekend Trip',
    description: 'I am going out of town for the weekend and need a reliable person to take care of my two cats. This includes feeding them twice a day, cleaning the litter box, and giving them some attention. Please have references.',
    budget: 100,
    category: getRandomItem(serviceCategories),
    location: 'Austin, TX',
    imageUrls: [],
  },
  {
      title: 'Looking for a Vintage Armchair',
      description: 'I am searching for a mid-century modern armchair to complete my living room set. It should be in good condition, preferably with original upholstery. Willing to pick up within a 50-mile radius.',
      budget: 400,
      category: getRandomItem(productCategories),
      location: 'Los Angeles, CA',
      imageUrls: [],
  },
  {
      title: 'Repair a Leaky Kitchen Faucet',
      description: 'The faucet in my kitchen sink has been dripping for a week, and it\'s starting to get on my nerves. I need a plumber to diagnose the problem and fix it. I am available most afternoons.',
      budget: 150,
      category: getRandomItem(serviceCategories),
      location: 'Chicago, IL',
      imageUrls: [],
  },
  {
      title: 'Professional Headshots for LinkedIn',
      description: 'I need a professional photographer to take some headshots for my LinkedIn profile. The style should be professional but approachable. The session should last about an hour and include a few edited digital photos.',
      budget: 250,
      category: getRandomItem(serviceCategories),
      location: 'Miami, FL',
      imageUrls: [],
  },
  {
      title: 'Sell Used Graphic Design Textbooks',
      description: 'I have a collection of graphic design textbooks from my college days that are in excellent condition. Looking to sell them as a bundle to a student or aspiring designer. List of titles available upon request.',
      budget: 120,
      category: getRandomItem(productCategories),
      location: 'Seattle, WA',
      imageUrls: [],
  },
  {
      title: 'Need a DJ for a Birthday Party',
      description: 'Hosting a 30th birthday party and need a DJ who can play a mix of 90s hip-hop, funk, and current top 40 hits. The party is on a Saturday night and will run for about 4 hours. Must have your own equipment.',
      budget: 600,
      category: getRandomItem(serviceCategories),
      location: 'Denver, CO',
      imageUrls: [],
  }
];


// --- Seeding Logic ---
async function seedDatabase() {
  console.log('Starting database seed...');

  const listingsCollection = db.collection('listings');
  const usersCollection = db.collection('users');

  // Optional: Clear existing data
  console.log('Clearing existing data...');
  const existingListings = await listingsCollection.get();
  const existingUsers = await usersCollection.get();
  const deleteBatch = db.batch();
  existingListings.forEach(doc => deleteBatch.delete(doc.ref));
  existingUsers.forEach(doc => deleteBatch.delete(doc.ref));
  await deleteBatch.commit();
  console.log('Existing data cleared.');

  // 1. Seed Users
  console.log('Seeding users...');
  const userPromises = usersToCreate.map(user => {
    const userRef = usersCollection.doc(user.uid);
    return userRef.set({
      ...user,
      createdAt: Timestamp.now(),
      rating: Math.random() * (5 - 3.5) + 3.5, // Random rating between 3.5 and 5
      reviewCount: Math.floor(Math.random() * 50) + 5,
      isPhoneVerified: true,
      isDocumentVerified: Math.random() > 0.5,
      address: {
          city: 'Sample City',
          state: 'CA'
      }
    });
  });
  await Promise.all(userPromises);
  console.log(`${usersToCreate.length} users seeded.`);

  // 2. Seed Listings
  console.log('Seeding listings...');
  const listingPromises = listingsToCreate.map(listing => {
    const randomUser = getRandomItem(usersToCreate);
    const listingRef = listingsCollection.doc();
    return listingRef.set({
      ...listing,
      authorId: randomUser.uid,
      categoryId: listing.category.id,
      status: 'publicado',
      createdAt: Timestamp.now(),
    });
  });
  await Promise.all(listingPromises);
  console.log(`${listingsToCreate.length} listings seeded.`);

  console.log('Database seeding completed successfully!');
}

seedDatabase().catch(error => {
  console.error('Error seeding database:', error);
});
