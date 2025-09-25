# Migration Guide: secureApi.js → api.js

## 🔄 Quick Migration Steps

The new simplified `api.js` maintains the same public API as `secureApi.js`, so most code should work without changes. However, some components may need updates:

### 1. Update Import Statements

**Before:**
```javascript
import secureApiService from '../services/secureApi';
```

**After:**
```javascript
import apiService from '../services/api';
```

### 2. Update Service Calls

Most method calls remain the same, but here are the key changes:

#### Authentication Methods (Same interface)
```javascript
// These remain unchanged
await apiService.login(credentials);
await apiService.register(userData);
await apiService.logout();
await apiService.refreshToken();
```

#### Resume Methods (Same interface)
```javascript
// These remain unchanged
await apiService.getResumes();
await apiService.getResume(id);
await apiService.customizeResume(id, jobDescription);
await apiService.downloadResumePDF(id, options);
```

#### Utility Methods (Same interface)
```javascript
// These remain unchanged
apiService.isAuthenticated();
apiService.getCurrentUser();
apiService.getPreviewPDFUrl(id, options);
```

### 3. Components That Need Updates

You'll need to update any components that directly import or use `secureApiService`:

#### ✅ Already Updated:
- `frontend/src/hooks/useAuth.jsx` - Updated to use `apiService`

#### 🔍 Check These Files:

Search for files that import `secureApiService`:
```bash
cd frontend/src
grep -r "secureApiService" . --include="*.js" --include="*.jsx"
grep -r "secureApi" . --include="*.js" --include="*.jsx"
```

Common files that may need updates:
- Resume-related components
- Application management components
- PDF preview components
- Any custom hooks that use the API

### 4. Update Pattern Examples

#### Resume Components
```javascript
// Before
import secureApiService from '../services/secureApi';

const MyComponent = () => {
  const handleCustomize = async () => {
    const result = await secureApiService.customizeResume(id, jobDescription);
    // ...
  };
};

// After  
import apiService from '../services/api';

const MyComponent = () => {
  const handleCustomize = async () => {
    const result = await apiService.customizeResume(id, jobDescription);
    // ...
  };
};
```

#### PDF Preview Components
```javascript
// Before
const pdfUrl = secureApiService.getPreviewPDFUrl(resumeId, { template: 'modern' });

// After
const pdfUrl = apiService.getPreviewPDFUrl(resumeId, { template: 'modern' });
```

### 5. Error Handling Updates

The new API service has simplified error handling:

#### Before (complex error handling):
```javascript
try {
  const result = await secureApiService.customizeResume(id, jobDescription);
} catch (error) {
  if (error.message.includes('RATE_LIMITED')) {
    // Handle rate limit
  } else if (error.message.includes('XSS_DETECTED')) {
    // Handle XSS
  }
  // Complex error categorization
}
```

#### After (simplified error handling):
```javascript
try {
  const result = await apiService.customizeResume(id, jobDescription);
} catch (error) {
  // Simple error handling - server provides appropriate messages
  console.error('Customization failed:', error.message);
  // Display user-friendly error message
}
```

### 6. Removed Features

These features from `secureApiService` are no longer available (and not needed):

#### ❌ Removed Client-Side Features:
- `sanitizeRequestData()` - Server handles sanitization
- `validateResponseSecurity()` - Not needed
- `checkSessionTimeout()` - Simplified session management
- `isValidTokenFormat()` - Server validates tokens
- Client-side rate limiting - Server handles this
- Complex security header validation
- Input sanitization methods

#### ✅ Server-Side Alternatives:
- Input sanitization: Server validates/sanitizes all inputs
- Rate limiting: Server enforces appropriate limits
- Security headers: Server middleware adds security headers
- Token validation: Server validates all tokens

### 7. Quick Search & Replace

You can use these commands to quickly update your files:

```bash
cd frontend/src

# Update imports
find . -name "*.js" -o -name "*.jsx" | xargs sed -i 's/secureApiService/apiService/g'
find . -name "*.js" -o -name "*.jsx" | xargs sed -i "s/from '..\/services\/secureApi'/from '..\/services\/api'/g"
find . -name "*.js" -o -name "*.jsx" | xargs sed -i 's/from ".\/services\/secureApi"/from ".\/services\/api"/g'
```

### 8. Testing After Migration

After updating imports, test these key flows:

1. **Authentication Flow**:
   - Login
   - Registration  
   - Token refresh
   - Logout

2. **Resume Operations**:
   - Upload resume
   - Get resumes list
   - Customize resume
   - Download PDF
   - Preview PDF

3. **Application Management**:
   - Create application
   - Update application status
   - View applications list

4. **Error Handling**:
   - Network errors
   - Authentication errors
   - Rate limiting (if testing with high volume)

### 9. Benefits After Migration

Once migrated, you'll get these benefits:

- 📈 **Better Performance**: No client-side security overhead
- 🐛 **Fewer Bugs**: Simpler code means fewer edge cases
- 🔧 **Easier Maintenance**: Clear, focused API service
- 🚀 **Faster Development**: Less complexity to understand
- 💪 **Better UX**: No false positive security blocks

### 10. Rollback Plan (if needed)

If you encounter issues, you can temporarily rollback:

1. Keep `secureApi.js` file (don't delete it yet)
2. Change imports back to `secureApiService`
3. Identify specific issues
4. Fix them in the new `api.js`
5. Re-migrate once issues are resolved

The old `secureApi.js` will continue to work, but you'll still get the backend improvements (rate limiting, redirects, etc.).

---

## 🎯 Summary

The migration is mostly a simple find-and-replace of import statements. The new `api.js` maintains the same public interface while removing unnecessary complexity. Your existing component logic should work without changes in most cases.

**Key Points**:
- Same method signatures
- Same return values  
- Simplified error handling
- Better performance
- Maintained security (server-side)
