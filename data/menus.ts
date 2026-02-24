
import { DayMenu, Weekday } from '../types';

export const MENUS: Record<Weekday, DayMenu> = {
  monday: {
    categories: [
      {
        categoryName: "Daily Selection",
        items: [
          {
            id: "m-med-chicken",
            name: "Mediterranean Chicken",
            description: "Brown rice & quinoa mix, Mediterranean chicken breast, leafy greens, cucumber, tomato, and a Tahini-Lemon dressing.",
            price: 12.90,
            image: "https://res.cloudinary.com/dp7dtmzb2/image/upload/v1771369139/MEDITERRANEAN_CHICKEN_iobysa.png",
            tags: ["High-Protein", "Fresh"],
            wooProductId: 1360,
            customizationOptions: {
              bases: ["Brown rice and quinoa mix", "No rice mix"],
              sauces: ["Tahini-Lemon dressing", "No sauce"],
              hasVegetarianOption: {
                label: "Make it vegetarian?",
                instructions: "replace protein with mushrooms"
              },
              dislikes: ["No leafy greens", "No cucumber", "No tomato"]
            }
          },
          {
            id: "m-bb-bump",
            name: "BIBI Bump Rice",
            description: "Brown rice, Korean-marinated beef, sautéed mushrooms, carrots, zucchini, and a bold gochujang sauce.",
            price: 15.90,
            image: "https://res.cloudinary.com/dp7dtmzb2/image/upload/v1771369139/BIBI_BAMP_RICE_kczybg.png",
            tags: ["Nutritious", "Balanced"],
            wooProductId: 1185,
            customizationOptions: {
              bases: ["Brown rice", "White rice", "No rice"],
              sauces: ["Gochujang sauce", "Soy sauce", "No sauce"],
              hasVegetarianOption: {
                label: "Make it vegetarian?",
                instructions: "replace protein with mushrooms"
              },
              dislikes: ["No mushrooms", "No carrots", "No zucchini"]
            }
          }
        ]
      }
    ]
  },
  tuesday: {
    categories: [
      {
        categoryName: "Daily Selection",
        items: [
          {
            id: "t-carne-asada",
            name: "Carne Asada",
            description: "Brown rice, Mexican-marinated steak, bell peppers, corn, red onion, black beans, and our Chilanga sauce.",
            price: 15.90,
            image: "https://res.cloudinary.com/dp7dtmzb2/image/upload/v1771369139/CARNE_ASADA_lfjnlg.png",
            tags: ["Premium", "Steak"],
            wooProductId: 1449,
            customizationOptions: {
              bases: ["Brown rice", "White rice", "No rice"],
              sauces: ["Chilanga sauce", "No sauce"],
              hasVegetarianOption: {
                label: "Make it vegetarian?",
                instructions: "replace protein with mushrooms"
              },
              dislikes: ["No bell peppers", "No red onion", "No corn", "No black beans"]
            }
          },
          {
            id: "t-chicken-lime",
            name: "Chicken Lime",
            description: "Quinoa, marinated chicken breast, leafy greens, corn, red onion, tomato, and a creamy lemon dressing.",
            price: 12.90,
            image: "https://res.cloudinary.com/dp7dtmzb2/image/upload/v1771369139/CHICKEN_LIME_rtggkr.png",
            tags: ["Light", "Zesty"],
            wooProductId: 1450,
            customizationOptions: {
              bases: ["Quinoa", "No quinoa"],
              sauces: ["Lemon creamy dressing", "No sauce"],
              hasVegetarianOption: {
                label: "Vegetariano?",
                instructions: "replace protein with mushrooms"
              },
              dislikes: ["No leafy greens", "No corn", "No red onion", "No tomato"]
            }
          }
        ]
      }
    ]
  },
  wednesday: {
    categories: [
      {
        categoryName: "Daily Selection",
        items: [
          {
            id: "w-pesto-pasta",
            name: "Chicken Pesto Pasta",
            description: "Fusilli/rotini, shredded chicken breast, mushrooms, capers, pine nuts, and a creamy pesto sauce.",
            price: 15.90,
            image: "https://res.cloudinary.com/dp7dtmzb2/image/upload/v1771369139/CHICKEN_PESTO_PASTA_b8flzw.png",
            tags: ["Italian", "Comfort"],
            wooProductId: 1452,
            customizationOptions: {
              bases: ["Traditional pasta (única)"],
              sauces: ["Creamy pesto sauce (única)"],
              hasVegetarianOption: {
                label: "Make it vegetarian?",
                instructions: "replace protein with mushrooms"
              },
              dislikes: ["No mushrooms", "No capers", "No pine nuts"]
            }
          },
          {
            id: "w-thai-beef",
            name: "Thai Beef Salad",
            description: "Quinoa, Thai-marinated steak, leafy greens, basil, mint, radish, cucumber, red onion, chopped peanuts, Thai dressing.",
            price: 15.90,
            image: "https://res.cloudinary.com/dp7dtmzb2/image/upload/v1771369140/THAI_BEEF_SALAD_ktgza9.png",
            tags: ["Spicy", "Thai"],
            wooProductId: 1455,
            customizationOptions: {
              bases: ["Quinoa", "No quinoa"],
              sauces: ["Thai dressing", "No sauce"],
              hasVegetarianOption: {
                label: "Make it vegetarian?",
                instructions: "Replace protein with mushrooms"
              },
              dislikes: ["No leafy greens", "No basil", "No mint", "No radish", "No cucumber", "No red onion", "No peanuts"]
            }
          }
        ]
      }
    ]
  },
  thursday: {
    categories: [
      {
        categoryName: "Daily Selection",
        items: [
          {
            id: "th-milanesa",
            name: "Milanesa",
            description: "Brown rice, milanesa chicken breast, carrot, zucchini, mushrooms, jalapeño mayo sauce.",
            price: 12.90,
            image: "https://res.cloudinary.com/dp7dtmzb2/image/upload/v1771369139/MILANESA_kqpck6.png",
            tags: ["Crispy", "Classic"],
            wooProductId: 1456,
            customizationOptions: {
              bases: ["Brown rice", "White rice", "No rice"],
              sauces: ["Jalapeño mayo", "Homemade mayo", "No sauce"],
              dislikes: ["No carrot", "No zucchini", "No mushrooms"]
            }
          },
          {
            id: "th-meatballs",
            name: "Harissa Meatballs",
            description: "Quinoa, harissa meatballs, leafy greens, cucumber, radish, pickled red onions, feta cheese, creamy Mediterranean dressing.",
            price: 15.90,
            image: "https://res.cloudinary.com/dp7dtmzb2/image/upload/v1771369139/HARISSA_MEATBALLS_gakt0h.png",
            tags: ["Mediterranean", "Spicy"],
            wooProductId: 1459,
            customizationOptions: {
              bases: ["Quinoa", "No quinoa"],
              sauces: ["Creamy Mediterranean sauce", "No sauce"],
              hasVegetarianOption: {
                label: "Make it vegetarian?",
                instructions: "Replace protein with mushrooms"
              },
              dislikes: ["No leafy greens", "No cucumbers", "No radish", "No pickled red onions", "No feta cheese"]
            }
          }
        ]
      }
    ]
  },
  friday: {
    categories: [
      {
        categoryName: "Daily Selection",
        items: [
          {
            id: "f-korean-chicken",
            name: "Crispy Korean Chicken",
            description: "Brown rice, crispy Korean chicken breast, glazed red cabbage, zucchini, carrot, red onion, gochujang sauce.",
            price: 12.90,
            image: "https://res.cloudinary.com/dp7dtmzb2/image/upload/v1771369139/CRISPY_KOREAN_CHICKEN_khpm4p.png",
            tags: ["Korean", "Crispy"],
            wooProductId: 1460,
            customizationOptions: {
              bases: ["Brown rice", "White rice", "No rice"],
              sauces: ["Gochujang sauce", "Soy sauce", "No sauce"],
              dislikes: ["No red cabbage", "No zucchini", "No carrot", "No red onion"]
            }
          },
          {
            id: "f-caesar-salad",
            name: "Chicken Caesar Salad",
            description: "Fusilli/rotini, curly kale, marinated chicken breast, paprika-roasted chickpeas, parmesan cheese, creamy lemon dressing.",
            price: 12.90,
            image: "https://res.cloudinary.com/dp7dtmzb2/image/upload/v1771369140/CHICKEN_CESAR_SALAD_vbyfrr.png",
            tags: ["Classic", "Fresh"],
            popular: true,
            wooProductId: 1463,
            customizationOptions: {
              bases: ["Traditional pasta", "No pasta"],
              sauces: ["Creamy lemon dressing", "No sauce"],
              hasVegetarianOption: {
                label: "Make it vegetarian?",
                instructions: "Replace protein with mushrooms"
              },
              dislikes: ["No chickpeas", "No parmesan cheese", "Replace curly kale for leafy greens"]
            }
          }
        ]
      }
    ]
  }
};
