#!/bin/bash
# Form Submission Test Script
# This script helps test the access request form submission

echo "════════════════════════════════════════════════════════════"
echo "Access Request Form - Submission Test"
echo "════════════════════════════════════════════════════════════"
echo ""

# Get Supabase details (edit these with your actual values)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"

# Test data
TEST_NAME="Test User"
TEST_EMAIL="test$(date +%s)@example.com"
TEST_PHONE="+387 61 234 5678"

echo "📋 Test Configuration:"
echo "   Supabase URL: $SUPABASE_URL"
echo "   Test Email:   $TEST_EMAIL"
echo "   Test Name:    $TEST_NAME"
echo ""

# Test 1: Insert via API
echo "🧪 Test 1: Inserting test record via Supabase API..."
echo ""

RESPONSE=$(curl -X POST \
  "$SUPABASE_URL/rest/v1/divers" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"phone\": \"$TEST_PHONE\",
    \"status\": \"pending\",
    \"access_status\": \"pending\",
    \"created_at\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\"
  }" \
  2>&1)

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 2: Query inserted record
echo "🔍 Test 2: Querying inserted record..."
echo ""

QUERY_RESPONSE=$(curl -X GET \
  "$SUPABASE_URL/rest/v1/divers?email=eq.$TEST_EMAIL" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  2>&1)

echo "Query Response:"
echo "$QUERY_RESPONSE" | jq '.' 2>/dev/null || echo "$QUERY_RESPONSE"
echo ""

# Test 3: Check RLS Policy
echo "📊 Test 3: RLS Policy Check"
echo "If the above request returned 403 Forbidden:"
echo "   1. Go to Supabase Dashboard"
echo "   2. Select your project"
echo "   3. Go to Authentication → Policies"
echo "   4. Check if 'divers' table allows anonymous INSERT"
echo "   5. If not, create a policy:"
echo "      - Policy: Allow anonymous insert"
echo "      - Target roles: anon"
echo "      - Operation: INSERT"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "✅ Test Complete!"
echo ""
echo "Next steps:"
echo "1. Check the responses above for errors"
echo "2. Verify record appears in Supabase divers table"
echo "3. If 403 error, configure RLS policy"
echo "4. Test form submission in the web application"
echo "════════════════════════════════════════════════════════════"
