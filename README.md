# 🍪 CookieRecipeApp

An app designed to store and search for cookie recipes. Allowing the search of recipes and details on recipes.

This app will allow the storage of several recipes for homemade cookies, ingredients used in the recipe, instructions on how to make them,
and the estimated time required. This app will also allow the ability to log in, addition of cookie recipes, favoriting recipes, searching for cookie recipes by keyword, category, and other search preferences, and an administrative page to access the database and manage the addition, modification, and deletion of recipes.

## 📋 Features

This app will provide useful tools regarding the managing of recipes.

1. Viewing of all recipes.
2. Searching recipes by title/keywords, category, or other preference options provided.
3. Viewing extended details of a single recipe.
4. Favoriting recipes, searching for favorited recipes.
5. Rating recipes and viewing rating averages of recipes.
6. Login functionality.
7. Using administrative tools provided to manage and validate recipes.
8. Adding, editing, and deleting recipes.

## 🧰 Prerequisites

You will require these packages in order to use this app.

`firebase firebase-admin`

This also will require a Google account to use all functionalities within this app.

## ⚙️ Setup

In order to start using this app, you need to create a .env.local file in the _root directory_.

In the .env.local file, put in:

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

**The values you will put in these are NOT to be shared with anyone!**

These values will be set up later.

## 🧪 Testing

To test the API routes, you need a firebase project, and to perform some setup.

After making the firebase project, in the project overview, go to 'Add app'.

Follow through the instructions, you don't need to activate Firebase Hosting. When you get your firebase app information, copy your app settings/config or leave it up.

Go into your .env.local, set each of the '`NEXT_PUBLIC_...`' variables to their respective values your firebase app provided from the shown "firebaseConfig" area.

Now you've set up the client app properly, next you will need a service account for your firebase project. Go to Project Settings, the gear by Project Overview, and select the Service accounts tab. In Firebase Admin SDK, create a new private key. This should download a file, **do not share it**, open it to view your private values. Go into your .env.local file you should have created earlier. Use 'project_id' as the value for 'FIREBASE_PROJECT_ID', use 'client_email' as the value for 'FIREBASE_CLIENT_EMAIL', and use all of 'private_key' as the value for 'FIREBASE_PRIVATE_KEY'

You will also have to define admins, which is done here by first initializing your Firestore Auth user of choice, and then Firestore Database.

You will now additionally have to initialize your user, sign in with Google as your Google user of choice, you can do this by running the project with `npm run dev` and using the navbar directing to the login to find the login page, and to follow through with logging in with Google.

When you log in with Google, it should add a user to Firebase Authentication. In the Build in the sidebar under the small Project Categories label, go to Authentication, and you should see your user in the 'Users' tab. There is the user ID (UID) as a value at the right of the user instance, and there should be a button to copy UID, select it and copy the UID. In the project sidebar go to Firestore Database under Build. Select your database of choice. In your database, under the Data tab which should be where you are at by default, select Start collection, name the collection ID "admins" and continue. Paste the UID into the ID of the document makign the document ID the UID, and you may name a string value "uid" and paste the UID as the value.

In the database page, go to the 'Rules' tab. Take away the code and paste this code in:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helpers
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }

    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.admin == true ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }

    // Recipes
    match /recipes/{id} {
      // read is public
      allow read: if resource.data.validated == true
              || (request.auth != null && resource.data.ownerId == request.auth.uid)
              || isAdmin();

      // when not an admin and signed in, create while unvalidated
      allow create: if (
          isSignedIn()
          && request.resource.data.ownerId == request.auth.uid
          && request.resource.data.validated == false
        )
        || isAdmin();

      // update and delete are allowed where
      //  owners can request updates or deletes
      //  admins can do unrestricted
      allow update, delete: if
        (
          isOwner(resource.data.ownerId)
          && request.resource.data.ownerId == resource.data.ownerId
          && request.resource.data.validated == resource.data.validated
        )
        || isAdmin();
    }

    // Admins
    match /admins/{uid} {
      allow read: if false;   // if false to hide list
      allow write: if false;  // if false to force server-only writes
    }
  }
}
```

Then publish changes to update your rules.

After you will need to go back into the database page and go to the 'Indexes' tab. Select 'Add Index', and under the collection ID field enter in "recipes". In the fields to index, set the first field path to "createdAt", and set the order to "Decending". In the second, set the field path to "validated" and keep it as "Ascending". Select "Add Field" once, and in the new third field set the field path to "`__name__`", that is with two underscores on each side, and keep the order as "Ascending". You should keep the query scope as "Collection", and then select 'Create'. This will take some time to complete the creation of the index.

Now if you followed all these steps, your project should be ready to test with `npm run dev`! You can navigate to the pages and perform whatever actions you wish!

## 📌 Versions

To view the versions of this project, view the project tags.

## ✏️ Authors

**Blaine Curtis** - _Project Initialization and Initial Development_ - [BlueBomber621](https://github.com/BlueBomber621)

## 🛠️ Built With

[**Next.js**](https://nextjs.org/) - _React framework used by this project_

[**Firebase**](https://firebase.google.com/) - _Backend for database and authentication_

```

```
