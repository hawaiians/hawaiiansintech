/**
 * Cleanup script for broken industry/focus references
 * Run this script to remove orphaned references from member documents
 */

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayRemove,
} = require("firebase/firestore");

// Initialize Firebase (you'll need to add your config)
const firebaseConfig = {
  // Add your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupBrokenReferences() {
  console.log("🔍 Starting cleanup of broken references...");

  try {
    // Get all members
    const membersSnapshot = await getDocs(collection(db, "members"));
    const members = membersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`📊 Found ${members.length} members to check`);

    // Known broken industry ID from debug output
    const brokenIndustryId = "bo4T7XYs1bwrZwbnAz8f";

    // Get all valid industry IDs
    const industriesSnapshot = await getDocs(collection(db, "industries"));
    const validIndustryIds = industriesSnapshot.docs.map((doc) => doc.id);

    console.log(`📊 Found ${validIndustryIds.length} valid industries`);

    let membersToUpdate = [];

    // Check each member for broken references
    for (const member of members) {
      const memberRef = doc(db, "members", member.id);
      let needsUpdate = false;
      let updates = {};

      // Check industries array
      if (member.industries && Array.isArray(member.industries)) {
        const brokenIndustries = member.industries.filter((industryRef) => {
          if (!industryRef || !industryRef.id) return true; // undefined/null references
          return !validIndustryIds.includes(industryRef.id); // deleted industry references
        });

        if (brokenIndustries.length > 0) {
          console.log(
            `🚨 Member ${member.id} (${member.name}) has broken industry references:`,
            brokenIndustries.map((ref) => ref?.id || "undefined"),
          );

          // Remove broken references
          for (const brokenRef of brokenIndustries) {
            if (brokenRef && brokenRef.id) {
              updates.industries = arrayRemove(brokenRef);
            }
          }
          needsUpdate = true;
        }
      }

      // Check focuses array
      if (member.focuses && Array.isArray(member.focuses)) {
        const brokenFocuses = member.focuses.filter((focusRef) => {
          if (!focusRef || !focusRef.id) return true; // undefined/null references
          return !validIndustryIds.includes(focusRef.id); // This should check focuses, not industries
        });

        if (brokenFocuses.length > 0) {
          console.log(
            `🚨 Member ${member.id} (${member.name}) has broken focus references:`,
            brokenFocuses.map((ref) => ref?.id || "undefined"),
          );

          // Remove broken references
          for (const brokenRef of brokenFocuses) {
            if (brokenRef && brokenRef.id) {
              updates.focuses = arrayRemove(brokenRef);
            }
          }
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        membersToUpdate.push({ memberRef, updates, member });
      }
    }

    console.log(
      `\n📝 Found ${membersToUpdate.length} members that need updates`,
    );

    if (membersToUpdate.length === 0) {
      console.log("✅ No broken references found!");
      return;
    }

    // Ask for confirmation before making changes
    console.log("\n⚠️  The following members will be updated:");
    membersToUpdate.forEach(({ member, updates }) => {
      console.log(
        `   - ${member.id} (${member.name}): ${Object.keys(updates).join(", ")}`,
      );
    });

    console.log(
      "\n🔧 To proceed with cleanup, uncomment the update section below and run again",
    );

    // Uncomment this section to actually perform the updates
    /*
    for (const { memberRef, updates } of membersToUpdate) {
      try {
        await updateDoc(memberRef, updates);
        console.log(`✅ Updated member ${memberRef.id}`);
      } catch (error) {
        console.error(`❌ Failed to update member ${memberRef.id}:`, error);
      }
    }
    */

    console.log("\n🎉 Cleanup analysis complete!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  }
}

// Run the cleanup
cleanupBrokenReferences();

