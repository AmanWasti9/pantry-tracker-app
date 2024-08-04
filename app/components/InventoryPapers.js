"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Box,
  Typography,
  TextField,
  Stack,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { getAuth } from "firebase/auth";

export default function InventoryPapers({ sortOrder, filterType }) {
  const [pantry, setPantry] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [imageURLs, setImageURLs] = useState({});
  const [editQuantity, setEditQuantity] = useState(1);
  const [editUnit, setEditUnit] = useState("kg"); // Default value
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const docRef = doc(firestore, "pantry", user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const items = data.items || {};
          let pantryList = [];
          let imageUrls = {};

          // Convert the items field into a list
          for (const [itemName, itemDetails] of Object.entries(items)) {
            pantryList.push({ id: itemName, name: itemName, ...itemDetails });
            imageUrls[itemName] = itemDetails.image || "/Images/apple.jpeg";
          }

          // Filter and sort items
          if (filterType === "start_a" || filterType === "start_z") {
            pantryList = pantryList.filter((item) => {
              const firstLetter = item.name[0].toLowerCase();
              return firstLetter >= "a" && firstLetter <= "z";
            });
            pantryList.sort((a, b) => {
              if (sortOrder === "asc") {
                return a.name.localeCompare(b.name);
              } else if (sortOrder === "desc") {
                return b.name.localeCompare(a.name);
              }
              return 0;
            });
          }

          if (sortOrder === "asc") {
            pantryList.sort((a, b) => a.count - b.count);
          } else if (sortOrder === "desc") {
            pantryList.sort((a, b) => b.count - a.count);
          }

          setPantry(pantryList);
          setImageURLs(imageUrls);
        } else {
          console.log("No document found with the specified UID.");
          setPantry([]);
        }
      });

      return () => unsubscribe();
    } else {
      console.warn("No user is logged in");
    }
  }, [sortOrder, filterType, user]);

  const deleteItem = async (itemName) => {
    try {
      if (user) {
        const docRef = doc(firestore, "pantry", user.uid);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const items = data.items || {};

          if (items[itemName]) {
            delete items[itemName];
            await updateDoc(docRef, { items });
          }
        }
      }
    } catch (error) {
      console.error("Error deleting item:", error.message);
    }
  };

  const handleSaveQuantity = async () => {
    try {
      if (user && currentItem) {
        const docRef = doc(firestore, "pantry", user.uid);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const items = data.items || {};

          items[currentItem.name] = {
            ...items[currentItem.name],
            count: editQuantity,
            unit: editUnit.toLowerCase(), // Normalize to lowercase
          };

          await updateDoc(docRef, { items });
          setEditMode(false); // Exit edit mode after saving
        }
      }
    } catch (error) {
      console.error("Error updating item quantity:", error.message);
    }
  };

  const handleItemClick = (item) => {
    setCurrentItem(item);
    setEditQuantity(item.count);
    setEditUnit(item.unit ? item.unit.toLowerCase() : "kg");
    setEditMode(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        "& > :not(style)": {
          m: 1,
          p: 1,
          width: "250px",
        },
      }}
    >
      {pantry.map((item) => (
        <Paper
          key={item.id}
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
          <div
            style={{
              width: "100%",
              height: "150px",
              overflow: "hidden",
            }}
          >
            <img
              src={imageURLs[item.name] || "/Images/apple.jpeg"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "12px",
              }}
              alt={item.name}
            />
          </div>
          <Typography fontSize={"25px"}>{item.name}</Typography>
          <br />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span>Quantity: </span>
            {editMode && currentItem && currentItem.id === item.id ? (
              <form
                onSubmit={(e) => e.preventDefault()}
                style={{ display: "flex", alignItems: "center" }}
              >
                <TextField
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Number(e.target.value))}
                  variant="standard"
                  InputProps={{
                    style: { border: "none", width: "50px" },
                  }}
                  sx={{ marginLeft: 1 }}
                />
                <FormControl sx={{ minWidth: 50 }}>
                  <Select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value.toLowerCase())} // Normalize to lowercase
                    variant="standard"
                    sx={{ border: "none" }}
                  >
                    <MenuItem value="kg">Kg</MenuItem>
                    <MenuItem value="g">g</MenuItem>
                    <MenuItem value="l">L</MenuItem>
                    <MenuItem value="ml">ml</MenuItem>
                  </Select>
                </FormControl>

                <CheckCircleOutlineIcon
                  onClick={handleSaveQuantity}
                  sx={{ marginLeft: 2, cursor: "pointer" }}
                />
              </form>
            ) : (
              <span
                onClick={() => handleItemClick(item)}
                style={{
                  marginLeft: 8,
                  cursor: "pointer",
                  borderBottom: "1px dashed gray",
                }}
              >
                {item.count} {item.unit}
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "5px",
            }}
          >
            <Button
              onClick={() => deleteItem(item.name)}
              variant="outlined"
              color="error"
              sx={{ fontSize: "14px" }}
            >
              <MdDelete />
            </Button>
            <Button
              onClick={() => handleItemClick(item)}
              variant="outlined"
              sx={{ marginLeft: 1, fontSize: "14px" }}
            >
              <FaEdit />
            </Button>
          </div>
        </Paper>
      ))}
    </Box>
  );
}
