"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Divider,
  Typography,
  Button,
  Popover,
  Stack,
  IconButton,
} from "@mui/material";
import { IoMdCloseCircle } from "react-icons/io";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import { GiKnifeFork } from "react-icons/gi";
import DashboardPapers from "../components/DashboardPapers";
import { RecipeService } from "../Services/RecipeService";
import styles from "../page.module.css";

const parseBoldText = (text) => {
  const parts = text.split(/\*\*/);

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>;
    }
    return part;
  });
};

export default function UserDashboard({ userFirstName }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [recipe, setRecipe] = useState("");
  const [pantryItems, setPantryItems] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      // console.log("User UID:", user.uid); // Log the UID to verify

      const fetchPantryItems = async () => {
        try {
          // Reference to the user's document in the pantry collection
          const docRef = doc(firestore, "pantry", user.uid);

          // console.log("Document reference:", docRef.path);

          // Fetch the document
          const docSnapshot = await getDoc(docRef);

          if (docSnapshot.exists()) {
            // console.log("Document data:", docSnapshot.data());

            // Access the 'items' field
            const items = docSnapshot.get("items");

            if (items) {
              // Convert the items object to an array of item names
              const itemNames = Object.keys(items).map(
                (key) => items[key].name || key
              );
              // console.log("Items field data:", itemNames);
              setPantryItems(itemNames);
            } else {
              // console.log("No 'items' field found in the document.");
              setPantryItems([]);
            }
          } else {
            // console.log("No document found with the specified UID.");
            setPantryItems([]);
          }
        } catch (error) {
          console.error("Error fetching data from Firestore:", error);
        }
      };

      fetchPantryItems();
    } else {
      console.warn("No user is logged in");
    }
  }, [user]);

  const handleLogOut = async () => {
    try {
      await auth.signOut();
      window.location.href = "/";
      // console.log("User logged out successfully");
    } catch (error) {
      // console.log(error);
    }
  };

  const handleAskRecipe = async () => {
    try {
      // Send pantryItems to the RecipeService
      const res_recipe = await RecipeService(pantryItems);
      setRecipe(res_recipe);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <Box>
      <Stack
        direction={"row"}
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h2">Dashboard</Typography>
        <Button variant="standard" onClick={handleLogOut}>
          Logout
        </Button>
      </Stack>

      <Divider />

      <Box
        margin="40px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h4">
          Welcome to PantryPilot, {userFirstName}!
        </Typography>
        <br />
        <Typography
          variant="body1"
          sx={{
            textAlign: "justify",
            marginBottom: 2,
          }}
        >
          We&apos;re excited to have you on board as you manage and explore your
          pantry like never before. With our intuitive platform, you can
          effortlessly store and organize your pantry items, and thanks to our
          integration with Gemini AI, you can now get personalized recipe
          suggestions based on the ingredients you have. Dive in and let us help
          you make the most out of your pantry!
        </Typography>

        <DashboardPapers />

        <GiKnifeFork
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            borderRadius: "50%",
            width: "100px",
            height: "100px",
            cursor: "pointer",
            background: "linear-gradient(#033363, #021F3B)",
            color: "white",
          }}
          onClick={handleClick}
          alt="Master Chef Logo"
        />

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              width: {
                xs: "80vw",
                sm: "50vw",
              },
              height: "80vh",
              display: "flex",
              flexDirection: "column",
              background: "linear-gradient(#033363, #021F3B)",
              color: "white",
            },
          }}
        >
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <IoMdCloseCircle />
          </IconButton>
          <Box
            sx={{
              padding: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              Smart Pantry Tracker Details
            </Typography>
            <Divider
              sx={{
                background: "white",
              }}
            />
            <Box sx={{ flex: 1, padding: 2 }}>
              <Stack>
                <pre className={styles.pre}>{parseBoldText(recipe)}</pre>
              </Stack>
            </Box>

            <Stack
              direction={"column"}
              sx={{
                justifyContent: "center",
                alignItems: "center",
                position: "sticky",
                bottom: 5,
                background: "linear-gradient(#033363, #021F3B)",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleAskRecipe}
                fullWidth
                sx={{
                  color: "white",
                }}
              >
                Ask
              </Button>
            </Stack>
          </Box>
        </Popover>
      </Box>
    </Box>
  );
}
