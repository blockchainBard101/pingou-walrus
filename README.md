# Walrus Profile Manager

A TypeScript library for managing user profiles on the Sui blockchain using Walrus decentralized storage. This library provides a simple interface for storing, retrieving, updating, and searching user profiles in a decentralized manner.

## Features

- **Profile Storage**: Store user profiles on Walrus decentralized storage
- **Profile Retrieval**: Retrieve profiles by blob ID
- **Profile Updates**: Update existing profiles with new data
- **Profile Search**: Search profiles by username (basic implementation)
- **TypeScript Support**: Full TypeScript support with type definitions
- **Sui Integration**: Built on top of Sui blockchain and Walrus storage
- **Timeout Handling**: Robust timeout configuration for network operations
- **Upload Relay**: Optimized upload performance with relay configuration

## Installation

```bash
npm install @mysten/sui @mysten/walrus dotenv undici
```

## Environment Setup

Create a `.env` file in your project root:

```env
PRIVATE_KEY=your_ed25519_private_key_here
```

**Note**: The private key should be in the format that `Ed25519Keypair.fromSecretKey()` expects. This is typically a Uint8Array or a string that can be directly used by the keypair constructor.

## UserProfile Interface

```typescript
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
```

## Usage

### Basic Setup

```typescript
import { WalrusProfileManager, UserProfile } from './index';

const profileManager = new WalrusProfileManager();
```

### Storing a Profile

```typescript
const profile: UserProfile = {
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

const blobId = await profileManager.storeProfile(profile);
console.log("Profile stored with ID:", blobId);
```

### Retrieving a Profile

```typescript
const profile = await profileManager.getProfile(blobId);
if (profile) {
  console.log("Retrieved profile:", profile);
} else {
  console.log("Profile not found");
}
```

### Updating a Profile

```typescript
const updatedBlobId = await profileManager.updateProfile(blobId, {
  firstname: "Johnny",
  updatedAt: Date.now(),
});
console.log("Profile updated with new ID:", updatedBlobId);
```

### Searching Profiles

```typescript
const profiles = await profileManager.searchProfilesByUsername("johndoe");
console.log("Found profiles:", profiles);
```

## API Reference

### WalrusProfileManager

#### Constructor

```typescript
constructor()
```

Initializes the WalrusProfileManager with:
- Sui testnet client
- Walrus testnet client
- Ed25519 keypair from environment variable

**Throws**: `Error` if `PRIVATE_KEY` environment variable is missing

#### Methods

##### `storeProfile(profile: UserProfile): Promise<string>`

Stores a user profile on Walrus storage.

**Parameters:**
- `profile`: The user profile object to store

**Returns:** Promise that resolves to the blob ID of the stored profile

**Throws:** Error if storage fails

##### `getProfile(blobId: string): Promise<UserProfile | null>`

Retrieves a user profile by its blob ID.

**Parameters:**
- `blobId`: The blob ID of the profile to retrieve

**Returns:** Promise that resolves to the user profile or null if not found

**Throws:** Error if retrieval fails

##### `updateProfile(blobId: string, updatedProfile: Partial<UserProfile>): Promise<string>`

Updates an existing profile with new data.

**Parameters:**
- `blobId`: The blob ID of the profile to update
- `updatedProfile`: Partial profile object with fields to update

**Returns:** Promise that resolves to the new blob ID of the updated profile

**Throws:** Error if profile not found or update fails

##### `searchProfilesByUsername(username: string): Promise<UserProfile[]>`

Searches for profiles by username.

**Parameters:**
- `username`: The username to search for

**Returns:** Promise that resolves to an array of matching profiles

**Note:** This is a basic implementation. A production app would require a more sophisticated search mechanism.

##### `getAllProfiles(): Promise<UserProfile[]>`

Gets all profiles (not implemented).

**Returns:** Promise that resolves to an empty array

**Note:** This method is not implemented and requires a search index for proper functionality.

## Configuration

### Network Settings

The library is configured to use:
- **Sui Network**: Testnet
- **Walrus Network**: Testnet
- **Storage Duration**: 3 epochs (configurable in `storeProfile`)

### Storage Settings

- **Epochs**: 3 (how long the data is stored)
- **Deletable**: true (allows deletion of stored data)
- **Content Type**: application/json
- **Profile Type**: user-profile

## Error Handling

The library includes comprehensive error handling:

- Missing environment variables
- Network connection issues
- Invalid profile data
- Storage failures
- Retrieval failures

All methods throw errors that should be caught and handled appropriately.

## Example

See the `main()` function in the source code for a complete example of:
1. Creating a sample profile
2. Storing the profile
3. Retrieving the profile
4. Updating the profile
5. Retrieving the updated profile

### Working Example Output

When you run `npm run dev`, you'll see output like this:

```
Storing profile...
Profile stored successfully: DL5JKVm6KNGEMBzXVsngegvZrwa7VTzjPUA4g5O1tJ0BAQACAA
Profile stored with ID: DL5JKVm6KNGEMBzXVsngegvZrwa7VTzjPUA4g5O1tJ0BAQACAA
Retrieving profile...
Retrieved profile: {
  email: 'john.doe@example.com',
  firstname: 'John',
  lastname: 'Doe',
  profile_picture: 'https://example.com/profile.jpg',
  username: 'johndoe',
  twitter_url: 'https://twitter.com/johndoe',
  instagram_url: 'https://instagram.com/johndoe',
  linkedin_url: 'https://linkedin.com/in/johndoe',
  discord: 'johndoe#1234',
  createdAt: 1759515966833,
  updatedAt: 1759515966833
}
Updating profile...
Profile stored successfully: 9S6vgdIMF0-IRFNHXolw9Q7rZWpB6lub2RkMPbF2y4IBAQACAA
Profile updated with new ID: 9S6vgdIMF0-IRFNHXolw9Q7rZWpB6lub2RkMPbF2y4IBAQACAA
Updated profile: {
  email: 'john.doe@example.com',
  firstname: 'Johnny',
  lastname: 'Doe',
  profile_picture: 'https://example.com/profile.jpg',
  username: 'johndoe',
  twitter_url: 'https://twitter.com/johndoe',
  instagram_url: 'https://instagram.com/johndoe',
  linkedin_url: 'https://linkedin.com/in/johndoe',
  discord: 'johndoe#1234',
  createdAt: 1759515966833,
  updatedAt: 1759515994833
}
```

## Dependencies

- `@mysten/sui`: Sui blockchain client
- `@mysten/walrus`: Walrus decentralized storage client
- `dotenv`: Environment variable management
- `undici`: HTTP client with timeout handling for network operations

## Recent Updates

### ✅ Code Corrections Applied

The code has been updated to follow the correct Walrus API patterns:

1. **Client Architecture**: Now uses the proper Sui client extension pattern instead of separate Walrus client
2. **Timeout Handling**: Added undici global dispatcher for robust network timeout handling (60 seconds)
3. **Upload Optimization**: Added upload relay configuration for better performance
4. **API Usage**: Updated all Walrus operations to use the correct `client.walrus.*` API
5. **Type Safety**: Improved TypeScript typing with proper client extension types
6. **Private Key Handling**: Simplified private key usage (removed unnecessary base64 decoding)

### ✅ Verified Working

The implementation has been tested and verified to work correctly:
- ✅ Profile storage successful
- ✅ Profile retrieval working
- ✅ Profile updates functional
- ✅ TypeScript compilation successful
- ✅ No linting errors

## Development

### Running the Example

```bash
npm run dev
```

### Building

```bash
npm run build
```