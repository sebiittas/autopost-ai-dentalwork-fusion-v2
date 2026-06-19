import { db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export const crearPost = async (texto, usuario, fechaProgramada = null, extra = {}) => {
  return await addDoc(collection(db, "posts"), {
    texto,
    caption: extra.caption || texto,
    visual_prompt: extra.visual_prompt || "",
    hashtags: Array.isArray(extra.hashtags) ? extra.hashtags : [],
    compliance_notes: extra.compliance_notes || "",
    suggested_status: extra.suggested_status || "draft",
    userId: usuario.uid,
    usuarioEmail: usuario.email,
    estado: fechaProgramada ? "programado" : "borrador",
    fechaProgramada: fechaProgramada || null,
    tema: extra.theme || "",
    subtipo: extra.subtype || "",
    canal: extra.channel || "Instagram",
    formato: extra.format || "post cuadrado 1:1",
    objetivo: extra.objective || "",
    estilo: extra.style || "",
    logo: extra.logo || null,
    referenceImageCount: Number(extra.referenceImageCount || 0),
    consentimientoReferencia: Boolean(extra.consentimientoReferencia || false),
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
};

export const obtenerPosts = async (userId) => {
  const q = query(
    collection(db, "posts"),
    where("userId", "==", userId),
    orderBy("creadoEn", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const eliminarPost = async (id) => {
  return await deleteDoc(doc(db, "posts", id));
};

export const actualizarPost = async (id, texto) => {
  return await updateDoc(doc(db, "posts", id), {
    texto,
    caption: texto,
    actualizadoEn: serverTimestamp(),
  });
};

export const programarPost = async (id, fechaProgramada) => {
  return await updateDoc(doc(db, "posts", id), {
    estado: "programado",
    fechaProgramada,
    actualizadoEn: serverTimestamp(),
  });
};
