import React, { useEffect } from 'react';
import styles from '../../styles/pages/TermsAndConditionsPage.module.css';

const TermsAndConditionsPage = () => {
    // Плавная прокрутка к якорю
    useEffect(() => {
        const handleHashClick = (e) => {
            const hash = window.location.hash;
            if (hash) {
                const element = document.querySelector(hash);
                if (element) {
                    e.preventDefault();
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };
        window.addEventListener('load', handleHashClick);
        return () => window.removeEventListener('load', handleHashClick);
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Terms and Conditions</h1>

            {/* Navigation */}
            <nav className={styles.navigation}>
                <h2>Content</h2>
                <ul>
                    <li><a href="#section1">1. General Provisions</a></li>
                    <li><a href="#section2">2. Terms of Use</a></li>
                    <li><a href="#section3">3. License to Use the Site</a></li>
                    <li><a href="#section4">4. User's Warranties</a></li>
                    <li><a href="#section5">5. License to User Content</a></li>
                    <li><a href="#section6">6. Restrictions on Use</a></li>
                    <li><a href="#section7">7. Notices and Newsletter</a></li>
                    <li><a href="#section8">8. Use of Electronic Signature</a></li>
                </ul>
            </nav>

            {/* Section 1 */}
            <section id="section1" className={styles.section}>
                <h2>1. General Provisions</h2>
                <p>1.1. In this document and the relations arising from or related to it, the following terms and definitions apply:</p>
                <p>a) Platform — software and hardware integrated with the Administration's Site;</p>
                <p>b) User — a capable individual who has acceded to this Agreement in their own interest or acting on behalf of the legal entity they represent;</p>
                <p>c) Administration's Site / Site — Internet sites located in the domain ________.ru and its subdomains;</p>
                <p>d) Service — a set of services and a license provided to the User using the Platform;</p>
                <p>e) Agreement — this Agreement with all additions and amendments.</p>
                <p>1.2. Your use of the Service in any way and in any form within its declared functionality, including:</p>
                <p>— viewing materials posted on the Site;</p>
                <p>— registration and/or authorization on the Site;</p>
                <p>— posting or displaying any materials on the Site, including but not limited to: texts, hypertext links, images, audio and video files, information and/or other data,</p>
                <p>constitutes a contract under the terms of this Agreement in accordance with Articles 437 and 438 of the Civil Code of the Russian Federation.</p>
                <p>1.3. By using any of the above options to use the Service, you confirm that:</p>
                <p>a) You have fully read the terms of this Agreement before using the Service;</p>
                <p>b) You accept all the terms of this Agreement in full without any exceptions or restrictions on your part and undertake to comply with them or stop using the Service. If you do not agree with the terms of this Agreement or are not entitled to conclude a contract on their basis, you must immediately stop any use of the Service;</p>
                <p>c) The Agreement (including any part thereof) may be changed by the Administration without any special notice. The new version of the Agreement comes into force from the moment it is posted on the Administration's Site or brought to the attention of the User in any other convenient form, unless otherwise provided by the new version of the Agreement.</p>
            </section>

            {/* Section 2 */}
            <section id="section2" className={styles.section}>
                <h2>2. Terms of Use</h2>
                <p>2.1. Using the functionality of the Service is allowed only after the User has passed registration and authorization on the Site in accordance with the procedure established by the Administration.</p>
                <p>2.2. Technical, organizational and commercial conditions for using the Service, including its functionality, are communicated to Users by separate posting on the Site or by notifying Users.</p>
                <p>2.3. The login and password chosen by the User are necessary and sufficient information for the User to access the Site. The User has no right to transfer their login and password to third parties, bears full responsibility for their safety, independently choosing the way to store them.</p>
            </section>

            {/* Section 3 */}
            <section id="section3" className={styles.section}>
                <h2>3. License to Use the Site</h2>
                <p>This section describes permitted ways to use the Site and the Service provided on its basis. The gratuitous nature of the license prevents the application of the Consumer Protection Law when the user is an individual.</p>
            </section>

            {/* Section 4 */}
            <section id="section4" className={styles.section}>
                <h2>4. User's Warranties</h2>
                <p>This section specifies guarantees and assurances from the user regarding compliance with legal requirements and the User Agreement when using the Site and the Service based on it. These provisions are necessary, in particular, for subsequent liability of the user for violations of the law or the rights of third parties in connection with the publication of illegal materials on the site.</p>
            </section>

            {/* Section 5 */}
            <section id="section5" className={styles.section}>
                <h2>5. License to User Content</h2>
                <p>When organizing a social service or platform for users to post various materials in the public domain, it is necessary to enter into a license agreement with each user for the use of their materials within the framework of such Internet service. For example, a user's permission to use their photo may be needed to publish it on the pages of other users, etc.</p>
                <p>In addition, obtaining a license confirms the fact that the content is used with the user's permission, who is responsible for having the authority to issue such a license.</p>
            </section>

            {/* Section 6 */}
            <section id="section6" className={styles.section}>
                <h2>6. Restrictions on Use</h2>
                <p>The User Agreement must clearly state the terms on limiting liability for the provision and use of the Service, including user content published with its use.</p>
                <p>In addition, compliance with the requirements of the Federal Law "On Information" as amended by the new anti-piracy law involves the removal of disputed materials by the information intermediary at the first request of the copyright holder. Therefore, the User Agreement should give the owner of the Internet service such an opportunity without prior approval and notification of the user.</p>
            </section>

            {/* Section 7 */}
            <section id="section7" className={styles.section}>
                <h2>7. Notices and Newsletter</h2>
                <p>This provision of the Agreement is aimed at complying with the requirements to prevent SPAM.</p>
            </section>

            {/* Section 8 */}
            <section id="section8" className={styles.section}>
                <h2>8. Use of Electronic Signature</h2>
                <p>This section includes the procedure for using a login and password or an email address as a simple electronic signature key. This condition is necessary to give legal force to all actions of the parties and to simplify possible document flow.</p>
            </section>
        </div>
    );
};

export default TermsAndConditionsPage;