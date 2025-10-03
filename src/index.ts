import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient, WalrusFile } from "@mysten/walrus";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Agent, setGlobalDispatcher } from "undici";
import dotenv from "dotenv";

dotenv.config();

// Node connect timeout is 10 seconds, and walrus nodes can be slow to respond
setGlobalDispatcher(
  new Agent({
    connectTimeout: 60_000,
    connect: { timeout: 60_000 },
  }),
);

// User profile interface
interface UserProfile {
  email: string;
  firstname: string;
  lastname: string;
  profile_picture?: string;
  username: string;
  twitter_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
  discord?: string;
  createdAt: number;
  updatedAt: number;
}

class WalrusProfileManager {
  private client: SuiClient & { walrus: WalrusClient };
  private signer: Ed25519Keypair;

  constructor() {
    // Initialize Sui client with Walrus extension
    this.client = new SuiClient({
      url: getFullnodeUrl("testnet"),
      network: "testnet",
    }).$extend(
      WalrusClient.experimental_asClientExtension({
        storageNodeClientOptions: {
          timeout: 60_000,
        },
        uploadRelay: {
          host: "https://upload-relay.testnet.walrus.space",
          sendTip: {
            max: 1_000,
          },
        },
      })
    );

    if (!process.env.PRIVATE_KEY) {
      throw new Error("Missing PRIVATE_KEY in .env file");
    }

    // Generate or load a keypair for signing transactions
    // Assuming the private key is base64 encoded
    this.signer = Ed25519Keypair.fromSecretKey(process.env.PRIVATE_KEY);
  }

  /**
   * Store a user profile on Walrus
   */
  async storeProfile(profile: UserProfile): Promise<string> {
    try {
      // Create a WalrusFile from the profile data
      const profileFile = WalrusFile.from({
        contents: new TextEncoder().encode(JSON.stringify(profile)),
        identifier: `profile_${profile.username}_${Date.now()}.json`,
        tags: {
          "content-type": "application/json",
          "profile-type": "user-profile",
          username: profile.username,
          email: profile.email,
        },
      });

      // Write the profile to Walrus
      const results = await this.client.walrus.writeFiles({
        files: [profileFile],
        epochs: 3, // Store for 3 epochs
        deletable: true,
        signer: this.signer,
      });

      console.log("Profile stored successfully:", results[0].id);
      return results[0].id;
    } catch (error) {
      console.error("Error storing profile:", error);
      throw error;
    }
  }

  /**
   * Retrieve a user profile by blob ID
   */
  async getProfile(blobId: string): Promise<UserProfile | null> {
    try {
      const files = await this.client.walrus.getFiles({ ids: [blobId] });

      if (files.length === 0) {
        console.log("Profile not found");
        return null;
      }

      const profileData = await files[0].json();
      return profileData as UserProfile;
    } catch (error) {
      console.error("Error retrieving profile:", error);
      throw error;
    }
  }

  /**
   * Search profiles by username
   */
  async searchProfilesByUsername(username: string): Promise<UserProfile[]> {
    try {
      // This is a simplified search - in a real app you'd want to implement
      // a more sophisticated search mechanism
      // For now, we'll return an empty array as the search functionality
      // would require implementing a proper search index
      console.log("Search functionality not fully implemented - requires search index");
      return [];
    } catch (error) {
      console.error("Error searching profiles:", error);
      return [];
    }
  }

  /**
   * Update an existing profile
   */
  async updateProfile(
    blobId: string,
    updatedProfile: Partial<UserProfile>
  ): Promise<string> {
    try {
      // Get the existing profile
      const existingProfile = await this.getProfile(blobId);
      if (!existingProfile) {
        throw new Error("Profile not found");
      }

      // Merge with updated data
      const mergedProfile: UserProfile = {
        ...existingProfile,
        ...updatedProfile,
        updatedAt: Date.now(),
      };

      // Store the updated profile
      return await this.storeProfile(mergedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  /**
   * Get all profiles (requires implementing a search index)
   */
  async getAllProfiles(): Promise<UserProfile[]> {
    try {
      // This would require implementing a search index
      // For now, we'll return an empty array
      console.log("getAllProfiles not implemented - requires search index");
      return [];
    } catch (error) {
      console.error("Error getting all profiles:", error);
      return [];
    }
  }
}

// Example usage
async function main() {
  const profileManager = new WalrusProfileManager();

  // Create a sample profile
  const sampleProfile: UserProfile = {
    email: "john.doe@example.com",
    firstname: "John",
    lastname: "Doe",
    profile_picture: "https://example.com/profile.jpg",
    username: "johndoe",
    twitter_url: "https://twitter.com/johndoe",
    instagram_url: "https://instagram.com/johndoe",
    linkedin_url: "https://linkedin.com/in/johndoe",
    discord: "johndoe#1234",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    // Store the profile
    console.log("Storing profile...");
    const blobId = await profileManager.storeProfile(sampleProfile);
    console.log("Profile stored with ID:", blobId);

    // Retrieve the profile
    console.log("Retrieving profile...");
    const retrievedProfile = await profileManager.getProfile(blobId);
    console.log("Retrieved profile:", retrievedProfile);

    // Update the profile
    console.log("Updating profile...");
    const updatedBlobId = await profileManager.updateProfile(blobId, {
      firstname: "Johnny",
      updatedAt: Date.now(),
    });
    console.log("Profile updated with new ID:", updatedBlobId);

    // Retrieve the updated profile
    const updatedProfile = await profileManager.getProfile(updatedBlobId);
    console.log("Updated profile:", updatedProfile);
  } catch (error) {
    console.error("Error in main:", error);
  }
}

// Run the example
main().catch(console.error);

export { WalrusProfileManager, UserProfile };
