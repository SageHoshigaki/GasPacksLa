import { useAuth } from "@clerk/clerk-react";

const CHECKR_API_BASE_URL = process.env.REACT_APP_CHECKR_API_BASE_URL;
const CHECKR_API_KEY = process.env.REACT_APP_CHECKR_API_KEY;

const initiateBackgroundCheck = async (userData, token) => {
  try {
    // First, create a document for the ID
    const documentResponse = await fetch(`${CHECKR_API_BASE_URL}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHECKR_API_KEY}`,
        "X-Clerk-Token": token,
      },
      body: JSON.stringify({
        type: "id",
        number: userData.idNumber,
        state: userData.idState,
        expiration_date: userData.idExpiration,
      }),
    });

    if (!documentResponse.ok) {
      throw new Error("Failed to create ID document");
    }

    const document = await documentResponse.json();

    // Create the candidate with ID document reference
    const response = await fetch(`${CHECKR_API_BASE_URL}/candidates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHECKR_API_KEY}`,
        "X-Clerk-Token": token,
      },
      body: JSON.stringify({
        first_name: userData.firstName,
        last_name: userData.lastName,
        dob: userData.dateOfBirth,
        ssn: userData.ssn,
        email: userData.email,
        phone: userData.phone,
        document_ids: [document.id],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create candidate");
    }

    const candidate = await response.json();

    // Create a background check package
    const packageResponse = await fetch(`${CHECKR_API_BASE_URL}/packages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHECKR_API_KEY}`,
        "X-Clerk-Token": token,
      },
      body: JSON.stringify({
        candidate_id: candidate.id,
        package: "driver_pro",
      }),
    });

    if (!packageResponse.ok) {
      throw new Error("Failed to create background check package");
    }

    return await packageResponse.json();
  } catch (error) {
    console.error("Error initiating background check:", error);
    throw error;
  }
};

const getBackgroundCheckStatus = async (checkId, token) => {
  try {
    const response = await fetch(`${CHECKR_API_BASE_URL}/reports/${checkId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CHECKR_API_KEY}`,
        "X-Clerk-Token": token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch background check status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching background check status:", error);
    throw error;
  }
};

const cancelBackgroundCheck = async (checkId, token) => {
  try {
    const response = await fetch(
      `${CHECKR_API_BASE_URL}/reports/${checkId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CHECKR_API_KEY}`,
          "X-Clerk-Token": token,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to cancel background check");
    }

    return await response.json();
  } catch (error) {
    console.error("Error canceling background check:", error);
    throw error;
  }
};

// Custom hook for background check operations
export const useBackgroundCheck = () => {
  const { getToken } = useAuth();

  const startCheck = async (userData) => {
    const token = await getToken();
    return await initiateBackgroundCheck(userData, token);
  };

  const checkStatus = async (checkId) => {
    const token = await getToken();
    return await getBackgroundCheckStatus(checkId, token);
  };

  const cancelCheck = async (checkId) => {
    const token = await getToken();
    return await cancelBackgroundCheck(checkId, token);
  };

  return {
    startCheck,
    checkStatus,
    cancelCheck,
  };
};
