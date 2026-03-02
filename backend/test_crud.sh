MANAGER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2Q1NWE5MWZmMTFkYzg1Njk1YTliMyIsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzcyNDczNzgyLCJleHAiOjE3NzI0NzczODJ9.NhSyhUYhtJaz5-wt5XP279M_3EwpcetG3sRA-Klfw84

echo "Testing POST (Create SP)..."
post_response=$(curl -s -X POST http://localhost:5000/api/manager/service-providers \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "CRUD Test SP", "email": "crudtest@sp.com", "password": "securepassword", "phone": "1234567890"}')

echo "POST Response:"
echo $post_response

provider_id=$(echo $post_response | grep -oP '(?<="_id":")[^"]*')
echo "Extracted Provider ID: $provider_id"

if [ -z "$provider_id" ]; then
  echo "Failed to extract provider ID. Aborting further tests."
  exit 1
fi

echo -e "\nTesting GET All..."
curl -s -X GET http://localhost:5000/api/manager/service-providers \
  -H "Authorization: Bearer $MANAGER_TOKEN" | head -c 500
echo "..."

echo -e "\nTesting GET One..."
curl -s -X GET http://localhost:5000/api/manager/service-providers/$provider_id \
  -H "Authorization: Bearer $MANAGER_TOKEN"

echo -e "\n\nTesting UPDATE (PUT)..."
curl -s -X PUT http://localhost:5000/api/manager/service-providers/$provider_id \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "CRUD Test SP Updated"}'

echo -e "\n\nTesting DELETE..."
curl -s -X DELETE http://localhost:5000/api/manager/service-providers/$provider_id \
  -H "Authorization: Bearer $MANAGER_TOKEN"
