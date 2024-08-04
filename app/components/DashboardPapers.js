"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import { getAuth } from "firebase/auth";
import CircleProgress from "./CircleProgress";

export default function DashboardPapers() {
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nearExpiryCount, setNearExpiryCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const auth = getAuth();
  const user = auth.currentUser;

  // Helper functions
  const isNearExpiry = (expiryDate) => {
    const nearExpiryThreshold = 7; // days
    const today = new Date();
    const expiry = new Date(expiryDate);
    const differenceInDays = (expiry - today) / (1000 * 60 * 60 * 24);
    return differenceInDays <= nearExpiryThreshold && differenceInDays >= 0;
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  useEffect(() => {
    if (user) {
      // console.log("User UID:", user.uid); // Log the UID to verify

      // Reference to the user's document in the pantry collection
      const docRef = doc(firestore, "pantry", user.uid);

      const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          // console.log("Document data:", docSnapshot.data());

          // Access the 'items' field
          const items = docSnapshot.get("items");

          if (items) {
            // Count the number of items and calculate total price
            const itemKeys = Object.keys(items);
            const itemCount = itemKeys.length;
            const total = itemKeys.reduce((sum, key) => {
              const item = items[key];
              const price = parseFloat(item.price) || 0; // Convert price to number
              return sum + price;
            }, 0);

            // Calculate near expiry and expired items
            let nearExpiryCount = 0;
            let expiredCount = 0;

            itemKeys.forEach((key) => {
              const item = items[key];
              const expiryDate = item.expiryDate;
              if (expiryDate) {
                if (isExpired(expiryDate)) {
                  expiredCount += 1;
                } else if (isNearExpiry(expiryDate)) {
                  nearExpiryCount += 1;
                }
              }
            });

            // console.log("Items field data:", items);
            // console.log("Total items count:", itemCount);
            // console.log("Total price:", total);
            // console.log("Near expiry items count:", nearExpiryCount);
            // console.log("Expired items count:", expiredCount);

            setTotalItems(itemCount);
            setTotalPrice(total);
            setNearExpiryCount(nearExpiryCount);
            setExpiredCount(expiredCount);
          } else {
            console.log("No 'items' field found in the document.");
            setTotalItems(0);
            setTotalPrice(0);
            setNearExpiryCount(0);
            setExpiredCount(0);
          }
        } else {
          console.log("No document found with the specified UID.");
          setTotalItems(0);
          setTotalPrice(0);
          setNearExpiryCount(0);
          setExpiredCount(0);
        }
      });

      // Cleanup function to unsubscribe from the listener
      return () => unsubscribe();
    } else {
      console.warn("No user is logged in");
    }
  }, [user]);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        "& > :not(style)": {
          m: 1,
          p: 5,
          width: "250px",
        },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: "10px",
          position: "relative",
          borderRadius: "12px",
        }}
      >
        <Typography fontSize={"40px"}>
          <CircleProgress value={totalItems} max={100} />{" "}
          {/* Set max as needed */}
        </Typography>
        <Typography>Total Pantry Items</Typography>
      </Paper>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: "10px",
          position: "relative",
          borderRadius: "12px",
        }}
      >
        <Typography fontSize={"40px"}>
          <CircleProgress value={totalPrice} max={1000} />{" "}
          {/* Set max as needed */}
        </Typography>
        <Typography>Total Price</Typography>
      </Paper>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: "10px",
          position: "relative",
          borderRadius: "12px",
        }}
      >
        <Typography fontSize={"40px"}>
          <CircleProgress value={nearExpiryCount} max={100} />{" "}
          {/* Set max as needed */}
        </Typography>
        <Typography>Near Expiry Items</Typography>
      </Paper>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: "10px",
          position: "relative",
          borderRadius: "12px",
        }}
      >
        <Typography fontSize={"40px"}>
          <CircleProgress value={expiredCount} max={100} />{" "}
          {/* Set max as needed */}
        </Typography>
        <Typography>Expired Items</Typography>
      </Paper>
    </Box>
  );
}
