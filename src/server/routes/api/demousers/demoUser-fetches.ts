import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';

console.enter();

// #region ============== FETCH POST /DEMOUSERS ================================

    // Browser-side fetch request
    const testCreateDemoUser = async () => {
      try {
        const response = await fetch('http://localhost:5555/demousers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: "Test",
            lastName: "DemoUser",
            email: "testdemouser@example.com",
            username: "testdemouser123",
            password: "password123"  // This will be hashed on the server
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Created DemoUser:', data);
      } catch (error) {
        console.error('Error creating DemoUser:', error);
      }
    };

    // ---------- You can test it in the browser console by calling:
    testCreateDemoUser();


    // ---------- Here is the fetch via curl in the shell
    /*
        curl -X POST http://localhost:5555/demousers \
          -H "Content-Type: application/json" \
          -d '{
            "firstName": "Test",
            "lastName": "DemoUser",
            "email": "testuser@example.com",
            "username": "testuser123",
            "password": "password123"
          }'
      */

// #endregion ------------------------------------------------------------------



// #region ============= FETCH PUT /DEMOUSER/:ID ===============================

const testUpdateDemoUser = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:5555/demouser/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: "Updated",
        lastName: "Name",
        email: "updated@example.com",
        username: "updateddemouser123"
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Updated DemoUser:', data);
  } catch (error) {
    console.error('Error updating DemoUser:', error);
  }
};

// ----------- Test it in the browser console by calling: ----------------------

testUpdateDemoUser(4); // Replace 1 with the actual DemoUser ID




// ---------- Here is the fetch via curl in the shell --------------------------

// curl -X PUT http://localhost:5555/demouser/1 \
//   -H "Content-Type: application/json" \
//   -d '{
//     "firstName": "Updated",
//     "lastName": "Name",
//     "email": "updated@example.com",
//     "username": "updateduser123"
//   }'

// #endregion ------------------------------------------------------------------




// #region ============ FETCH DELETE /DEMOUSER/:ID =============================


const testDeleteDemoUser = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:5555/demouser/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Delete response:', data);
  } catch (error) {
    console.error('Error deleting DemoUser:', error);
  }
};

// ----------- Test it in the browser console by calling: ----------------------

testDeleteDemoUser(4); // Replace 1 with the actual DemoUser ID


// ---------- Here is the fetch via curl in the shell --------------------------

// curl -X DELETE http://localhost:5555/demouser/4



// #endregion ------------------------------------------------------------------




console.leave();


// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
