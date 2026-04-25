/**
 * ContactSection Component
 * Secondary advertising section for contact information
 */
import { motion } from 'framer-motion';

const ContactItem = ({ icon, label, value, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[var(--color-primary)]/30 hover:bg-white/[0.06] transition-all duration-300 group"
  >
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-2xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p className="text-[var(--color-text-primary)] font-bold group-hover:text-[var(--color-primary)] transition-colors">
        {value}
      </p>
    </div>
  </a>
);

export default function ContactSection() {
  return (
    <section id="partners" className="py-20 bg-white/[0.01]">
      <div className="page-container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="section-title">Đối <span className="gradient-text">tác</span></h2>
            <p className="section-subtitle">Bạn đang tìm đối tác công nghệ để thiết kế Website, phần mềm hoặc giải pháp số cho doanh nghiệp?</p>
            <p>Hãy liên hệ với DvaGroup để được tư vấn và triển khai nhanh chóng, hiệu quả.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <ContactItem
              icon="📘"
              label="Facebook"
              value="DvaGroup Official"
              href="https://www.facebook.com/share/14Wk8XRErss/?mibextid=wwXIfr"
            />
            <ContactItem
              icon="💬"
              label="Zalo"
              value="0386137558"
              href="https://zalo.me/0386137558"
            />
            <ContactItem
              icon="✉️"
              label="Gmail"
              value="dvagroup.work@gmail.com"
              href="mailto:dvagroup.work@gmail.com"
            />
            <ContactItem
              icon="📞"
              label="Phone"
              value="0386137558"
              href="tel:0386137558"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
