import { Document, Page, View, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { registerPdfFonts, FONT_FAMILY } from "@/lib/pdfFonts";
import type { ResumeContent } from "@/services/aiService";

const styles = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    color: "#1f2933",
    padding: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f4858",
    marginBottom: 4,
  },
  contacts: {
    fontSize: 10,
    color: "#5b6770",
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2f4858",
    marginTop: 14,
    marginBottom: 6,
    borderBottom: "1pt solid #d8dde1",
    paddingBottom: 3,
  },
  entry: {
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: "bold",
  },
  entryPeriod: {
    fontSize: 10,
    color: "#5b6770",
    marginBottom: 2,
  },
  entryDescription: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  skills: {
    fontSize: 10,
    lineHeight: 1.4,
  },
});

function ResumeDocument({ content, title }: { content: NonNullable<ResumeContent>; title: string }) {
  const experience = content.experience ?? [];
  const education = content.education ?? [];
  const skills = content.skills ?? [];
  const contactsLine = [content.contacts?.email, content.contacts?.phone].filter(Boolean).join(" · ");

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{content.fullName || title}</Text>
        {contactsLine ? <Text style={styles.contacts}>{contactsLine}</Text> : null}

        {experience.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>Опыт работы</Text>
            {experience.map((entry, i) => {
              const titleLine = [entry.company, entry.role].filter(Boolean).join(" — ");
              return (
                <View key={i} style={styles.entry}>
                  {titleLine ? <Text style={styles.entryTitle}>{titleLine}</Text> : null}
                  {entry.period ? <Text style={styles.entryPeriod}>{entry.period}</Text> : null}
                  {entry.description ? (
                    <Text style={styles.entryDescription}>{entry.description}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {education.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>Образование</Text>
            {education.map((entry, i) => {
              const titleLine = [entry.institution, entry.degree].filter(Boolean).join(" — ");
              return (
                <View key={i} style={styles.entry}>
                  {titleLine ? <Text style={styles.entryTitle}>{titleLine}</Text> : null}
                  {entry.period ? <Text style={styles.entryPeriod}>{entry.period}</Text> : null}
                </View>
              );
            })}
          </View>
        )}

        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>Навыки</Text>
            <Text style={styles.skills}>{skills.join(", ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function renderResumePdf(
  content: NonNullable<ResumeContent>,
  title: string
): Promise<Buffer> {
  registerPdfFonts();
  return renderToBuffer(<ResumeDocument content={content} title={title} />);
}
